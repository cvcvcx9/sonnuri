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
import urllib.parse

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

# 간결한 S3 키 생성 함수
def generate_short_s3_key(sentence: str) -> str:
    """
    Generate a short and unique key for S3 and local file storage.
    """
    short_sentence = sentence[:10].strip()
    unique_hash = hashlib.md5(sentence.encode()).hexdigest()[:8]
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{short_sentence}_{unique_hash}_{timestamp}.mp4"

class VideoConnector:
    def __init__(self, output_dir: str = "temp_frames"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

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

    def extract_all_frames(self, video_path: str) -> tuple:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        frame_idx = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_path = f"{self.output_dir}/frame_{frame_idx:04d}.png"
            cv2.imwrite(frame_path, frame)
            frame_idx += 1

        cap.release()
        return fps, (width, height)

    def create_final_video(self, fps: float, size: tuple, output_path: str):
        width, height = size
        temp_output = output_path + '.temp.mp4'
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_output, fourcc, fps, (width, height))

        try:
            for frame_file in sorted(os.listdir(self.output_dir)):
                if frame_file.endswith(".png"):
                    frame = cv2.imread(os.path.join(self.output_dir, frame_file))
                    frame = cv2.resize(frame, (width, height))
                    out.write(frame)

            out.release()
            self.convert_with_ffmpeg(temp_output, output_path)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                raise Exception(f"Final video file is invalid: {output_path}")

            print(f"Final video created successfully: {output_path}, size: {os.path.getsize(output_path)}")

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

    async def process_videos(self, video_urls: List[str], sentence: str, output_filename: str) -> str:
        try:
            temp_dir = "temp_videos"
            output_dir = "output"
            os.makedirs(output_dir, exist_ok=True)

            print("Downloading videos...")
            local_paths = await self.download_videos_concurrently_async(video_urls)
            if not all(os.path.exists(p) for p in local_paths):
                raise Exception("One or more video downloads failed.")

            print("Extracting frames...")
            fps, size = self.extract_all_frames(local_paths[0])  # 첫 번째 동영상 사용 예제

            print("Creating final video...")
            self.create_final_video(fps, size, output_filename)

            print("Uploading to S3...")
            s3_url, s3_key = self.upload_to_s3(output_filename, sentence)

            print("Saving to MongoDB...")
            collection.insert_one({
                "Sentence": sentence,
                "URL": s3_url,
                "S3 Key": s3_key
            })

            self.cleanup_temp_files(temp_dir, output_dir)
            return s3_url

        except Exception as e:
            self.cleanup_temp_files(temp_dir, output_dir)
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
