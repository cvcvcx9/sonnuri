import cv2
import os
import hashlib
import boto3
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import requests
from dotenv import load_dotenv
import shutil
from concurrent.futures import ThreadPoolExecutor
import numpy as np

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

# S3 설정
S3_BUCKET = os.getenv('AWS_S3_BUCKET')
S3_REGION = os.getenv('AWS_REGION')
s3_client = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=S3_REGION
)

class VideoConnector:
    def __init__(self, output_dir: str = "temp_frames"):
        self.output_dir = output_dir
        self.word_to_safe = {}
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(f"{output_dir}/words", exist_ok=True)
        os.makedirs(f"{output_dir}/interpolated", exist_ok=True)

    def get_safe_name(self, word: str) -> str:
        return hashlib.md5(word.encode()).hexdigest()

    def download_video(self, url: str, local_path: str) -> bool:
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, stream=True, headers=headers, verify=False)
            response.raise_for_status()

            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return os.path.getsize(local_path) > 0

        except Exception as e:
            print(f"Download error: {str(e)}")
            return False

    def download_videos_concurrently(self, video_urls: List[str]) -> List[str]:
        temp_dir = "temp_videos"
        os.makedirs(temp_dir, exist_ok=True)
        local_paths = []

        def download_single_video(index_url):
            index, url = index_url
            local_path = os.path.join(temp_dir, f"video_{index}.mp4")
            if self.download_video(url, local_path):
                local_paths.append(local_path)

        with ThreadPoolExecutor() as executor:
            executor.map(download_single_video, enumerate(video_urls))

        return local_paths

    def extract_all_frames(self, video_path: str, word: str) -> tuple:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        safe_word = self.get_safe_name(word)
        word_dir = f"{self.output_dir}/words/{safe_word}"
        os.makedirs(word_dir, exist_ok=True)

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

    def extract_frames_concurrently(self, local_paths: List[str], words: List[str]) -> tuple:
        fps = None
        size = None
        with ThreadPoolExecutor() as executor:
            results = executor.map(lambda p: self.extract_all_frames(*p), zip(local_paths, words))
            for res in results:
                fps, size = res if fps is None else (fps, size)
        return fps, size

    def interpolate_frames(self, frame1_path: str, frame2_path: str, output_dir: str, num_interpolated_frames: int = 10):
        """두 프레임 사이에 보간 프레임 생성"""
        frame1 = cv2.imread(frame1_path)
        frame2 = cv2.imread(frame2_path)

        os.makedirs(output_dir, exist_ok=True)
        
        for i in range(1, num_interpolated_frames + 1):
            alpha = i / (num_interpolated_frames + 1)
            interpolated_frame = cv2.addWeighted(frame1, 1 - alpha, frame2, alpha, 0)
            cv2.imwrite(f"{output_dir}/interp_{i:04d}.png", interpolated_frame)

        print(f"{num_interpolated_frames}개의 보간 프레임이 생성되었습니다.")

    def create_final_video(self, words: List[str], fps: float, size: tuple, output_path: str):
        width, height = size
        temp_output = output_path + '.temp.mp4'
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_output, fourcc, fps, (width, height))

        try:
            for i, word in enumerate(words):
                safe_word = self.get_safe_name(word)
                word_dir = f"{self.output_dir}/words/{safe_word}"
                frame_files = sorted([f for f in os.listdir(word_dir) if f.startswith("frame_")])

                for frame_file in frame_files:
                    frame = cv2.imread(os.path.join(word_dir, frame_file))
                    if frame is not None:
                        frame = cv2.resize(frame, (width, height))
                        out.write(frame)

                # 보간 프레임 생성 및 추가
                if i < len(words) - 1:
                    safe_word_next = self.get_safe_name(words[i + 1])
                    last_frame = f"{self.output_dir}/words/{safe_word}/frame_{len(frame_files) - 1:04d}.png"
                    first_frame_next = f"{self.output_dir}/words/{safe_word_next}/frame_0000.png"
                    interp_dir = f"{self.output_dir}/interpolated/{safe_word}_{safe_word_next}"
                    
                    self.interpolate_frames(last_frame, first_frame_next, interp_dir)

                    interp_files = sorted([f for f in os.listdir(interp_dir) if f.startswith("interp_")])
                    for interp_file in interp_files:
                        frame = cv2.imread(os.path.join(interp_dir, interp_file))
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

    def convert_with_ffmpeg(self, temp_output: str, output_path: str):
        import subprocess
        command = [
            'ffmpeg', '-i', temp_output,
            '-c:v', 'libx264', '-preset', 'medium', '-movflags', 'faststart',
            '-pix_fmt', 'yuv420p', '-y', output_path
        ]
        subprocess.run(command, check=True)
        os.remove(temp_output)

    def upload_to_s3(self, file_path: str, s3_key: str) -> str:
        try:
            extra_args = {
                'ContentType': 'video/mp4',
                'ContentDisposition': 'inline'
            }
            s3_client.upload_file(
                file_path, 
                S3_BUCKET, 
                s3_key,
                ExtraArgs=extra_args
            )
            return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
        except Exception as e:
            print(f"S3 upload error: {str(e)}")
            raise

    def process_videos(self, video_urls: List[str], output_filename: str) -> str:
        if os.path.exists("output"):
            shutil.rmtree("output")
        os.makedirs("output")

        local_paths = self.download_videos_concurrently(video_urls)
        words = [f"word_{i}" for i in range(len(local_paths))]

        fps, size = self.extract_frames_concurrently(local_paths, words)
        self.create_final_video(words, fps, size, output_filename)

        s3_key = f"sentence/{os.path.basename(output_filename)}"
        s3_url = self.upload_to_s3(output_filename, s3_key)

        self.cleanup_temp_files(temp_dir="temp_videos", output_dir="output")
        return s3_url

    def cleanup_temp_files(self, temp_dir: str, output_dir: str):
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        if os.path.exists(self.output_dir):
            shutil.rmtree(self.output_dir)

class VideoRequest(BaseModel):
    video_urls: list[str]

@app.post('/process_videos')
async def process_videos(request: VideoRequest):
    try:
        video_urls = request.video_urls
        if not isinstance(video_urls, list) or not video_urls:
            raise HTTPException(status_code=400, detail="유효한 비디오 URL 리스트가 필요합니다.")
        
        output_filename = f"processed_{hashlib.md5(''.join(video_urls).encode()).hexdigest()}.mp4"
        
        connector = VideoConnector()
        s3_url = connector.process_videos(video_urls, output_filename)
        
        return JSONResponse(
            content={
                "status": "success",
                "video_url": s3_url
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
