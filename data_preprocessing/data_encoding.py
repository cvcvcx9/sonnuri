import os
import subprocess
from pathlib import Path

def reencode_video(input_path: str, output_dir: str):
    """비디오 재인코딩"""
    try:
        # 출력 파일 경로 생성 (같은 이름 유지)
        input_filename = os.path.basename(input_path)
        output_path = os.path.join(output_dir, input_filename)

        # ffmpeg 명령어
        command = [
            'ffmpeg', '-i', input_path,
            '-c:v', 'libx264',           # H.264 코덱
            '-preset', 'medium',         # 인코딩 속도/품질 균형
            '-movflags', '+faststart',   # 웹 스트리밍 최적화
            '-pix_fmt', 'yuv420p',       # 호환성
            '-profile:v', 'baseline',    # 웹 브라우저 호환성
            '-level', '3.0',             # 호환성 레벨
            '-maxrate', '2M',            # 최대 비트레이트
            '-bufsize', '2M',            # 버퍼 크기
            '-threads', str(os.cpu_count()),
            '-y', output_path
        ]
        
        # 실행
        subprocess.run(command, check=True)
        print(f"Successfully reencoded: {input_filename}")
        return True
        
    except Exception as e:
        print(f"Encoding error for {input_path}: {str(e)}")
        return False

def process_directory(input_dir: str, output_dir: str):
    """디렉토리 내의 모든 .mp4 파일 처리"""
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # .mp4 파일 찾기
    input_path = Path(input_dir)
    video_files = list(input_path.glob('**/*.mp4'))
    
    print(f"Found {len(video_files)} .mp4 files")
    
    # 각 파일 처리
    for video_file in video_files:
        print(f"\nProcessing: {video_file}")
        reencode_video(str(video_file), output_dir)

if __name__ == "__main__":
    # 입력 및 출력 디렉토리 설정
    INPUT_DIR = "C:/Users/SSAFY/Desktop/A301/encoding_data"  # 원본 비디오가 있는 디렉토리
    OUTPUT_DIR = "C:/Users/SSAFY/Desktop/A301/reencoded_videos"  # 재인코딩된 비디오를 저장할 디렉토리
    
    process_directory(INPUT_DIR, OUTPUT_DIR)