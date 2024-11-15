import boto3
from dotenv import load_dotenv
import os
import pandas as pd
import re
from urllib.parse import unquote

# .env 파일 로드
load_dotenv()

class VideoInfoCollector:
    def __init__(self):
        self.s3_client = boto3.client('s3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        self.bucket_name = os.getenv('AWS_S3_BUCKET')
        self.video_info = []

    def extract_info_from_filename(self, filename: str) -> tuple:
        """파일 이름에서 번호와 형태소 추출"""
        pattern = r'(\d+)_(.+)\.mp4'
        match = re.match(pattern, filename)
        if match:
            number, morpheme = match.groups()
            return number, morpheme
        return None, None

    def get_all_videos(self):
        """AI_Videos 폴더의 모든 비디오 정보 수집"""
        try:
            # AI_Videos 폴더의 모든 객체 나열
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix='AI_Videos/'
            )

            for page in pages:
                for obj in page.get('Contents', []):
                    # mp4 파일만 처리
                    if obj['Key'].endswith('.mp4'):
                        filename = os.path.basename(obj['Key'])
                        number, morpheme = self.extract_info_from_filename(filename)
                        
                        if number and morpheme:
                            # S3 URL 생성
                            url = f"https://{self.bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{obj['Key']}"
                            
                            # 정보 저장
                            info = {
                                "Number": number,
                                "Morpheme": morpheme,
                                "Sentence": f"형태소: {morpheme}",  # 실제 문장은 별도로 제공되어야 함
                                "URL": url,
                                "S3 Key": obj['Key'],
                                "Filename": filename,
                                "LastModified": obj['LastModified'],
                                "Size": obj['Size']
                            }
                            
                            self.video_info.append(info)
                            print(f"비디오 정보 수집 완료: {filename}")

        except Exception as e:
            print(f"정보 수집 중 에러 발생: {str(e)}")

    def save_to_csv(self, output_path: str = "s3_video_info.csv"):
        """수집된 정보를 CSV 파일로 저장"""
        if self.video_info:
            df = pd.DataFrame(self.video_info)
            # LastModified 열을 datetime 형식으로 변환
            df['LastModified'] = pd.to_datetime(df['LastModified'])
            # Size를 MB 단위로 변환
            df['Size_MB'] = df['Size'] / (1024 * 1024)
            # 필요한 열 순서 정렬
            columns_order = [
                "Number", 
                "Morpheme", 
                "Sentence", 
                "URL", 
                "S3 Key", 
                "Filename", 
                "LastModified", 
                "Size_MB"
            ]
            df = df[columns_order]
            df.to_csv(output_path, index=False, encoding='utf-8-sig')
            print(f"\n총 {len(self.video_info)}개의 비디오 정보가 '{output_path}'에 저장되었습니다.")
            return df
        return None

def main():
    collector = VideoInfoCollector()
    
    # 비디오 정보 수집
    print("S3에서 비디오 정보를 수집하는 중...")
    collector.get_all_videos()
    
    # CSV 파일로 저장
    df = collector.save_to_csv()
    
    if df is not None:
        print("\n=== 수집된 정보 요약 ===")
        print(f"총 비디오 수: {len(df)}")
        print(f"총 용량: {df['Size_MB'].sum():.2f}MB")
        print(f"가장 최근 업로드: {df['LastModified'].max()}")
        print(f"가장 오래된 업로드: {df['LastModified'].min()}")

if __name__ == "__main__":
    main()