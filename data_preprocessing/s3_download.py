import boto3
import os
from botocore.exceptions import ClientError
from typing import List
import concurrent.futures

def download_s3_folder(s3_client, bucket_name: str, s3_folder: str, local_dir: str, max_workers: int = 10) -> List[str]:
    """
    S3 폴더 내의 모든 파일을 로컬 디렉토리로 다운로드
    
    Args:
        s3_client: boto3 s3 client
        bucket_name: S3 버킷 이름
        s3_folder: S3 내의 폴더 경로 (prefix)
        local_dir: 로컬 저장 경로
        max_workers: 동시 다운로드 작업 수
    
    Returns:
        다운로드된 파일 경로 리스트
    """
    downloaded_files = []
    
    try:
        # S3 폴더 내 모든 객체 나열
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, Prefix=s3_folder)
        
        download_tasks = []
        
        def download_file(obj):
            try:
                # S3 키에서 파일 이름 추출
                file_name = os.path.basename(obj['Key'])
                if not file_name:  # 폴더인 경우 스킵
                    return None
                    
                local_path = os.path.join(local_dir, file_name)
                
                # 로컬 디렉토리가 없으면 생성
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                
                # 파일 다운로드
                s3_client.download_file(
                    bucket_name,
                    obj['Key'],
                    local_path
                )
                print(f"다운로드 완료: {obj['Key']} -> {local_path}")
                return local_path
                
            except Exception as e:
                print(f"다운로드 실패 {obj['Key']}: {str(e)}")
                return None
        
        # 모든 객체에 대해 다운로드 작업 생성
        for page in pages:
            for obj in page.get('Contents', []):
                if not obj['Key'].endswith('/'):  # 폴더는 제외
                    download_tasks.append(obj)
        
        # ThreadPoolExecutor를 사용하여 병렬 다운로드 실행
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(download_file, obj) for obj in download_tasks]
            
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                if result:
                    downloaded_files.append(result)
        
        print(f"총 {len(downloaded_files)}개 파일 다운로드 완료")
        return downloaded_files
        
    except ClientError as e:
        print(f"S3 접근 오류: {str(e)}")
        return []
    except Exception as e:
        print(f"예상치 못한 오류: {str(e)}")
        return []

# 사용 예시
def main():
    # AWS 자격 증명
    AWS_ACCESS_KEY_ID = 'AKIA2S2Y4FMSRRPLS7JG'
    AWS_SECRET_ACCESS_KEY = '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'
    
    # S3 클라이언트 초기화
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )
    
    # S3 설정
    BUCKET_NAME = 'sonnuri'
    S3_FOLDER = 'AI_videos/'  # 다운로드할 S3 폴더 경로
    LOCAL_DIR = 'downloaded_videos'   # 로컬 저장 경로
    
    # 폴더 내 모든 파일 다운로드
    downloaded_files = download_s3_folder(
        s3_client,
        BUCKET_NAME,
        S3_FOLDER,
        LOCAL_DIR,
        max_workers=10  # 동시 다운로드 수
    )
    
    # 다운로드된 파일 목록 출력
    for file_path in downloaded_files:
        print(f"다운로드된 파일: {file_path}")

if __name__ == "__main__":
    main()