import os
import cv2
import hashlib
import boto3
import pymongo
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import asyncio
import aiohttp
import datetime
from dotenv import load_dotenv
import shutil

# .env 파일 로드
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB 설정
MONGO_USERNAME = os.getenv('MONGO_USERNAME')
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')
mongo_client = pymongo.MongoClient(f"mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@k11a301.p.ssafy.io:8017/?authSource=admin")
db = mongo_client["sonnuri"]
collection = db["sign_sentence"]

# S3 설정
S3_BUCKET = os.getenv('AWS_S3_BUCKET')
S3_REGION = os.getenv('AWS_REGION')
s3_client = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=S3_REGION
)

def generate_short_s3_key(sentence: str) -> str:
    short_sentence = sentence[:10].strip()
    unique_hash = hashlib.md5(sentence.encode()).hexdigest()[:8]
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{short_sentence}_{unique_hash}_{timestamp}.mp4"

class VideoConnector:
    def __init__(self, output_dir: str = "temp_frames"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(f"{output_dir}/words", exist_ok=True)
        os.makedirs(f"{output_dir}/interpolated", exist_ok=True)

    def get_safe_name(self, word: str) -> str:
        return hashlib.md5(word.encode()).hexdigest()

    async def download_video_async(self, url: str, local_path: str) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    response.raise_for_status()
                    with open(local_path, 'wb') as f:
                        while chunk := await response.content.read(1024):
                            f.write(chunk)
            return os.path.getsize(local_path) > 0
        except Exception as e:
            print(f"Async download error: {str(e)}")
            return False

    async def download_videos_concurrently_async(self, video_urls: List[str]) -> List[str]:
        temp_dir = "temp_videos"
        os.makedirs(temp_dir, exist_ok=True)
        local_paths = []
        tasks = []

        for index, url in enumerate(video_urls):
            local_path = os.path.join(temp_dir, f"video_{index}.mp4")
            tasks.append(self.download_video_async(url, local_path))
            local_paths.append(local_path)

        await asyncio.gather(*tasks)
        return local_paths

    def extract_frames(self, video_path: str, word_index: str) -> tuple:
        """비디오에서 프레임 추출"""
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        word_dir = f"{self.output_dir}/words/word_{word_index}"
        os.makedirs(word_dir, exist_ok=True)

        frames = []
        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_path = f"{word_dir}/frame_{frame_idx:04d}.png"
            cv2.imwrite(frame_path, frame)
            frame_idx += 1

        cap.release()
        return fps, (width, height)

    def interpolate_frames(self, frame1: str, frame2: str, output_dir: str, num_frames: int = 15):
        """
        더 부드러운 전환을 위한 개선된 보간 처리
        - 프레임 수를 30으로 증가
        - 이징(easing) 함수 적용
        - 블렌딩 개선
        """
        frame1_img = cv2.imread(frame1)
        frame2_img = cv2.imread(frame2)
        
        os.makedirs(output_dir, exist_ok=True)
        
        def ease_in_out(t):
            # 부드러운 전환을 위한 이징 함수
            if t < 0.5:
                return 2 * t * t
            else:
                return -1 + (4 - 2 * t) * t
        
        for i in range(num_frames):
            # 이징 함수를 적용한 알파값 계산
            t = i / (num_frames - 1)
            alpha = ease_in_out(t)
            
            # 이미지 블렌딩
            interpolated = cv2.addWeighted(
                frame1_img, 1 - alpha,
                frame2_img, alpha,
                0
            )
            
            # 선택적으로 약간의 모션 블러 적용
            if 0.2 < alpha < 0.8:  # 중간 프레임들에만 적용
                kernel_size = max(3, int(5 * min(alpha, 1-alpha)))
                interpolated = cv2.GaussianBlur(interpolated, (kernel_size, kernel_size), 0)
                
            output_path = f"{output_dir}/interp_{i:04d}.png"
            cv2.imwrite(output_path, interpolated)

    def create_final_video(self, num_videos: int, fps: float, size: tuple, output_path: str):
        """최종 비디오 생성 (보간 프레임 포함)"""
        width, height = size
        temp_output = output_path + '.temp.mp4'
        output_fps =  min(fps * 1.5, 60)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_output, fourcc,  output_fps, (width, height))

        try:
            for i in range(num_videos):
                # 현재 단어의 프레임들 추가
                word_dir = f"{self.output_dir}/words/word_{i}"
                frames = sorted([f for f in os.listdir(word_dir) if f.startswith("frame_")])
                
                for frame_file in frames:
                    frame = cv2.imread(os.path.join(word_dir, frame_file))
                    if frame is not None:
                        frame = cv2.resize(frame, (width, height))
                        out.write(frame)

                # 다음 단어와의 보간 프레임 추가
                if i < num_videos - 1:
                    last_frame = f"{word_dir}/frame_{len(frames)-1:04d}.png"
                    next_word_dir = f"{self.output_dir}/words/word_{i+1}"
                    first_frame_next = f"{next_word_dir}/frame_0000.png"
                    
                    interp_dir = f"{self.output_dir}/interpolated/interp_{i}_{i+1}"
                    self.interpolate_frames(last_frame, first_frame_next, interp_dir)
                    
                    # 보간 프레임 추가
                    interp_frames = sorted(os.listdir(interp_dir))
                    for interp_frame in interp_frames:
                        frame = cv2.imread(os.path.join(interp_dir, interp_frame))
                        if frame is not None:
                            frame = cv2.resize(frame, (width, height))
                            out.write(frame)

            out.release()
            self.convert_with_ffmpeg(temp_output, output_path)

        except Exception as e:
            print(f"Video creation error: {str(e)}")
            out.release()
            if os.path.exists(temp_output):
                os.remove(temp_output)
            raise

    def convert_with_ffmpeg(self, temp_output: str, output_path: str):
        import subprocess
        command = [
            'ffmpeg', '-i', temp_output,
            '-c:v', 'libx264', '-preset', 'medium', '-movflags', 'faststart',
            '-pix_fmt', 'yuv420p', '-threads', str(os.cpu_count()), '-y', output_path
        ]
        try:
            subprocess.run(command, check=True)
            os.remove(temp_output)
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg conversion failed: {e}")
            raise

    def upload_to_s3(self, file_path: str, sentence: str) -> tuple[str, str]:
        try:
            if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                raise ValueError(f"Invalid file for upload: {file_path}")

            s3_key = generate_short_s3_key(sentence)

            print(f"Uploading file: {file_path} to S3 key: {s3_key}")
            s3_client.upload_file(
                file_path, 
                S3_BUCKET, 
                s3_key,
                ExtraArgs={
                    'ContentType': 'video/mp4',
                    'ContentDisposition': 'inline'
                }
            )
            url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
            return url, s3_key
        except Exception as e:
            print(f"S3 upload error: {e}")
            raise

    def cleanup_temp_files(self, temp_dir: str, output_dir: str):
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        if os.path.exists(self.output_dir):
            shutil.rmtree(self.output_dir)

    async def process_videos(self, video_urls: List[str], sentence: str, output_filename: str) -> str:
        try:
            temp_dir = "temp_videos"
            output_dir = "output"
            os.makedirs(output_dir, exist_ok=True)

            print("Downloading videos...")
            local_paths = await self.download_videos_concurrently_async(video_urls)
            if not all(os.path.exists(p) for p in local_paths):
                raise Exception("One or more video downloads failed.")

            print("Extracting frames from videos...")
            fps = None
            size = None
            for i, video_path in enumerate(local_paths):
                current_fps, current_size = self.extract_frames(video_path, str(i))
                fps = fps or current_fps
                size = size or current_size

            print("Creating final video with interpolation...")
            self.create_final_video(len(video_urls), fps, size, output_filename)

            print("Uploading to S3...")
            s3_url, s3_key = self.upload_to_s3(output_filename, sentence)

            print("Saving to MongoDB...")
            collection.insert_one({
                "Sentence": sentence,
                "URL": s3_url,
                "S3 Key": s3_key
            })

            print("Cleaning up temporary files...")
            self.cleanup_temp_files(temp_dir, output_dir)

            if os.path.exists(output_filename):
                os.remove(output_filename)

            return s3_url

        except Exception as e:
            print("Error occurred, cleaning up...")
            self.cleanup_temp_files(temp_dir, output_dir)
            if os.path.exists(output_filename):
                os.remove(output_filename)
            raise Exception(f"Video processing failed: {str(e)}")

class VideoRequest(BaseModel):
    video_urls: List[str]
    sentence: str

@app.post('/process_videos')
async def process_videos(request: VideoRequest):
    try:
        video_urls = request.video_urls
        sentence = request.sentence

        if not isinstance(video_urls, list) or not video_urls:
            raise HTTPException(status_code=400, detail="유효한 비디오 URL 리스트가 필요합니다.")
        
        if not sentence:
            raise HTTPException(status_code=400, detail="문장이 필요합니다.")
        
        output_filename = generate_short_s3_key(sentence)
        
        connector = VideoConnector()
        s3_url = await connector.process_videos(video_urls, sentence, output_filename)
        
        return JSONResponse(
            content={
                "status": "success",
                "video_url": s3_url,
                "sentence": sentence
            },
            status_code=200
        )

    except Exception as e:
        return JSONResponse(
            content={
                "status": "error",
                "message": str(e)
            },
            status_code=500
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)