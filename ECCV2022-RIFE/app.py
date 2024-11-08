import cv2
import os
import hashlib
import boto3
from typing import List
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import requests
from tempfile import NamedTemporaryFile

app = Flask(__name__)

# S3 설정
S3_BUCKET = 'your-bucket-name'
S3_REGION = 'ap-northeast-2'
s3_client = boto3.client('s3',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY',
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
        """URL에서 비디오 다운로드"""
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        except Exception as e:
            print(f"비디오 다운로드 실패: {str(e)}")
            return False

    def extract_all_frames(self, video_path: str, word: str) -> tuple:
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"비디오 파일을 찾을 수 없습니다: {video_path}")
            
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"비디오를 열 수 없습니다: {video_path}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        safe_word = self.get_safe_name(word)
        word_dir = f"{self.output_dir}/words/{safe_word}"
        os.makedirs(word_dir, exist_ok=True)
        
        frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(frame)
        
        cap.release()
        
        if not frames:
            raise ValueError(f"비디오에서 프레임을 읽을 수 없습니다: {video_path}")
        
        for i, frame in enumerate(frames):
            frame_path = f"{word_dir}/frame_{i:04d}.png"
            success = cv2.imwrite(frame_path, frame)
            if not success:
                raise ValueError(f"프레임 저장 실패: {frame_path}")
        
        cv2.imwrite(f"{self.output_dir}/words/{safe_word}_first.png", frames[0])
        cv2.imwrite(f"{self.output_dir}/words/{safe_word}_last.png", frames[-1])
        
        print(f"비디오 {word}에서 {len(frames)}개의 프레임 추출 완료")
        self.word_to_safe[word] = safe_word
        return fps, (width, height)

    def interpolate_frames(self, word1: str, word2: str):
        safe_word1 = self.get_safe_name(word1)
        safe_word2 = self.get_safe_name(word2)
        
        last_frame = f"{self.output_dir}/words/{safe_word1}_last.png"
        first_frame = f"{self.output_dir}/words/{safe_word2}_first.png"
        
        output_dir = f"{self.output_dir}/interpolated/{safe_word1}_{safe_word2}"
        os.makedirs(output_dir, exist_ok=True)
        
        command = f'python inference_img.py --img "{last_frame}" "{first_frame}" --exp=3'
        os.system(command)
        
        for i in range(16):
            src = f"output/img{i}.png"
            dst = f"{output_dir}/frame_{i:04d}.png"
            if os.path.exists(src):
                os.rename(src, dst)

    def create_final_video(self, words: List[str], fps: float, size: tuple, output_path: str):
        width, height = size
        out = cv2.VideoWriter(output_path, 
                            cv2.VideoWriter_fourcc(*'mp4v'),
                            fps, 
                            (width, height))
        
        for i, word in enumerate(words):
            safe_word = self.get_safe_name(word)
            word_dir = f"{self.output_dir}/words/{safe_word}"
            frame_files = sorted([f for f in os.listdir(word_dir) if f.startswith("frame_")])
            
            for frame_file in frame_files:
                frame = cv2.imread(os.path.join(word_dir, frame_file))
                if frame is not None:
                    frame = cv2.resize(frame, (width, height))
                    out.write(frame)
            
            if i < len(words) - 1:
                safe_word_next = self.get_safe_name(words[i+1])
                interp_dir = f"{self.output_dir}/interpolated/{safe_word}_{safe_word_next}"
                if os.path.exists(interp_dir):
                    interp_files = sorted([f for f in os.listdir(interp_dir) if f.startswith("frame_")])
                    for interp_file in interp_files:
                        frame = cv2.imread(os.path.join(interp_dir, interp_file))
                        if frame is not None:
                            frame = cv2.resize(frame, (width, height))
                            out.write(frame)
        
        out.release()
        print("최종 영상 생성 완료")

    def upload_to_s3(self, file_path: str, s3_key: str) -> str:
        """파일을 S3에 업로드하고 URL 반환"""
        try:
            s3_client.upload_file(file_path, S3_BUCKET, s3_key)
            url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
            return url
        except Exception as e:
            print(f"S3 업로드 실패: {str(e)}")
            raise

    def process_videos(self, video_urls: List[str], output_filename: str) -> str:
        """비디오 URL 리스트를 처리하고 결과 비디오의 S3 URL 반환"""
        try:
            if os.path.exists("output"):
                import shutil
                shutil.rmtree("output")
            os.makedirs("output")
            
            # 임시 디렉토리 생성
            temp_dir = "temp_videos"
            os.makedirs(temp_dir, exist_ok=True)
            
            # 비디오 다운로드
            local_paths = []
            for i, url in enumerate(video_urls):
                local_path = os.path.join(temp_dir, f"video_{i}.mp4")
                if not self.download_video(url, local_path):
                    raise ValueError(f"비디오 다운로드 실패: {url}")
                local_paths.append(local_path)
            
            fps = None
            size = None
            
            # 가상의 단어 리스트 생성 (인덱스 기반)
            words = [f"word_{i}" for i in range(len(video_urls))]
            
            # 프레임 추출
            for word, video_path in zip(words, local_paths):
                curr_fps, curr_size = self.extract_all_frames(video_path, word)
                if fps is None:
                    fps = curr_fps
                    size = curr_size
            
            # 보간 수행
            for i in range(len(words)-1):
                print(f"보간 처리 중: {words[i]} -> {words[i+1]}")
                self.interpolate_frames(words[i], words[i+1])
            
            # 최종 비디오 생성
            self.create_final_video(words, fps, size, output_filename)
            
            # S3에 업로드
            s3_key = f"processed_videos/{os.path.basename(output_filename)}"
            s3_url = self.upload_to_s3(output_filename, s3_key)
            
            # 임시 파일 정리
            shutil.rmtree(temp_dir)
            if os.path.exists("output"):
                shutil.rmtree("output")
            
            return s3_url
            
        except Exception as e:
            print(f"처리 중 오류 발생: {str(e)}")
            raise

@app.route('/process_videos', methods=['POST'])
def process_videos():
    try:
        data = request.get_json()
        if not data or 'video_urls' not in data:
            return jsonify({'error': '비디오 URL 리스트가 필요합니다'}), 400
        
        video_urls = data['video_urls']
        if not isinstance(video_urls, list) or not video_urls:
            return jsonify({'error': '유효한 비디오 URL 리스트가 필요합니다'}), 400
        
        output_filename = f"processed_{hashlib.md5(''.join(video_urls).encode()).hexdigest()}.mp4"
        
        connector = VideoConnector()
        s3_url = connector.process_videos(video_urls, output_filename)
        
        return jsonify({
            'status': 'success',
            'video_url': s3_url
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)