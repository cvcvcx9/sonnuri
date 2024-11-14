import boto3
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()

def upload_to_s3(file_path: str) -> str:
    """
    로컬 파일을 S3에 업로드하고 URL 반환
    
    Args:
        file_path (str): 로컬 파일 경로
    
    Returns:
        str: 업로드된 파일의 S3 URL
    """
    try:
        # S3 클라이언트 설정
        s3_client = boto3.client('s3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        
        # S3 버킷 이름
        bucket_name = os.getenv('AWS_S3_BUCKET')
        
        # 파일명 추출
        file_name = os.path.basename(file_path)
        
        # S3 키 생성 (예: videos/filename.mp4)
        s3_key = f"videos/{file_name}"
        
        # S3에 업로드
        extra_args = {
            'ContentType': 'video/mp4',
            'ContentDisposition': 'inline'
        }
        
        s3_client.upload_file(
            file_path, 
            bucket_name,
            s3_key,
            ExtraArgs=extra_args
        )
        
        # S3 URL 생성
        url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{s3_key}"
        
        return url
        
    except Exception as e:
        print(f"업로드 중 에러 발생: {str(e)}")
        raise

# 사용 예시
if __name__ == "__main__":
    try:
        local_file_path = "path/to/your/video.mp4"
        video_url = upload_to_s3(local_file_path)
        print(f"업로드된 비디오 URL: {video_url}")
    except Exception as e:
        print(f"에러: {str(e)}")