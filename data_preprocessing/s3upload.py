import boto3
from dotenv import load_dotenv
import os
import pandas as pd
from typing import List, Dict
import re

# .env 파일 로드
load_dotenv()

class VideoUploader:
    def __init__(self):
        self.s3_client = boto3.client('s3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        self.bucket_name = os.getenv('AWS_S3_BUCKET')
        self.uploaded_info = []
    
    def extract_info_from_filename(self, filename: str) -> tuple:
        """파일 이름에서 번호와 형태소 추출"""
        pattern = r'(\d+)_(.+)\.mp4'
        match = re.match(pattern, filename)
        if match:
            number, morpheme = match.groups()
            return number, morpheme
        return None, None
        
    def upload_to_s3(self, file_path: str) -> Dict:
        """
        비디오를 S3에 업로드하고 관련 정보 반환
        """
        try:
            # 파일명에서 정보 추출
            filename = os.path.basename(file_path)
            number, morpheme = self.extract_info_from_filename(filename)
            
            # S3 키 생성 (AI_Videos 폴더에 저장)
            s3_key = f"AI_Videos/{filename}"
            
            # S3에 업로드
            extra_args = {
                'ContentType': 'video/mp4',
                'ContentDisposition': 'inline'
            }
            
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name,
                s3_key,
                ExtraArgs=extra_args
            )
            
            # S3 URL 생성
            url = f"https://{self.bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{s3_key}"
            
            # 정보 저장
            info = {
                "Number": number,
                "Morpheme": morpheme,
                "Sentence": f"형태소: {morpheme}",  # 실제 문장은 별도로 제공되어야 함
                "URL": url,
                "S3 Key": s3_key,
                "Filename": filename
            }
            
            self.uploaded_info.append(info)
            print(f"업로드 완료: {filename}")
            return info
            
        except Exception as e:
            print(f"'{file_path}' 업로드 중 에러 발생: {str(e)}")
            return None

    def save_to_csv(self, output_path: str = "upload_info.csv"):
        """업로드 정보를 CSV 파일로 저장"""
        if self.uploaded_info:
            df = pd.DataFrame(self.uploaded_info)
            df.to_csv(output_path, index=False, encoding='utf-8-sig')
            print(f"\n정보가 '{output_path}'에 저장되었습니다.")

def process_videos():
    # 비디오 파일 디렉토리
    video_dir = "C:/Users/SSAFY/Desktop/A301/new_wd_video"
    
    uploader = VideoUploader()
    
    # 디렉토리 내의 모든 mp4 파일 처리
    for filename in os.listdir(video_dir):
        if filename.endswith('.mp4'):
            video_path = os.path.join(video_dir, filename)
            try:
                uploader.upload_to_s3(video_path)
            except Exception as e:
                print(f"'{filename}' 처리 중 에러 발생: {str(e)}")
    
    # 모든 정보를 CSV로 저장
    uploader.save_to_csv()

if __name__ == "__main__":
    try:
        process_videos()
    except Exception as e:
        print(f"실행 중 에러 발생: {str(e)}")