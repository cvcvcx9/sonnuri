import cv2
import os
from typing import List
import hashlib

class VideoConnector:
   def __init__(self, output_dir: str = "temp_frames"):
       self.output_dir = output_dir
       self.word_to_safe = {}  # 단어와 안전한 파일명 매핑 저장
       os.makedirs(output_dir, exist_ok=True)
       os.makedirs(f"{output_dir}/words", exist_ok=True)
       os.makedirs(f"{output_dir}/interpolated", exist_ok=True)
       
   def get_safe_name(self, word: str) -> str:
       """한글 단어를 안전한 파일명으로 변환"""
       return hashlib.md5(word.encode()).hexdigest()

   def extract_all_frames(self, video_path: str, word: str) -> tuple:
       """비디오의 모든 프레임 추출"""
       if not os.path.exists(video_path):
           raise FileNotFoundError(f"비디오 파일을 찾을 수 없습니다: {video_path}")
           
       cap = cv2.VideoCapture(video_path)
       if not cap.isOpened():
           raise ValueError(f"비디오를 열 수 없습니다: {video_path}")
       
       fps = cap.get(cv2.CAP_PROP_FPS)
       width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
       height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
       
       # 안전한 파일명 생성
       safe_word = self.get_safe_name(word)
       word_dir = f"{self.output_dir}/words/{safe_word}"
       os.makedirs(word_dir, exist_ok=True)
       
       # 프레임 저장을 위한 리스트
       frames = []
       
       # 모든 프레임 읽기
       while True:
           ret, frame = cap.read()
           if not ret:
               break
           frames.append(frame)
       
       cap.release()
       
       if not frames:
           raise ValueError(f"비디오에서 프레임을 읽을 수 없습니다: {video_path}")
       
       # 프레임 저장
       for i, frame in enumerate(frames):
           frame_path = f"{word_dir}/frame_{i:04d}.png"
           success = cv2.imwrite(frame_path, frame)
           if not success:
               raise ValueError(f"프레임 저장 실패: {frame_path}")
       
       # 첫 프레임과 마지막 프레임 따로 저장
       cv2.imwrite(f"{self.output_dir}/words/{safe_word}_first.png", frames[0])
       cv2.imwrite(f"{self.output_dir}/words/{safe_word}_last.png", frames[-1])
       
       print(f"비디오 {word}에서 {len(frames)}개의 프레임 추출 완료")
       self.word_to_safe[word] = safe_word  # 매핑 저장
       return fps, (width, height)

   def interpolate_frames(self, word1: str, word2: str):
       """두 단어 사이의 프레임을 보간"""
       safe_word1 = self.get_safe_name(word1)
       safe_word2 = self.get_safe_name(word2)
       
       last_frame = f"{self.output_dir}/words/{safe_word1}_last.png"
       first_frame = f"{self.output_dir}/words/{safe_word2}_first.png"
       
       # 보간 결과 저장 디렉토리
       output_dir = f"{self.output_dir}/interpolated/{safe_word1}_{safe_word2}"
       os.makedirs(output_dir, exist_ok=True)
       
       ## 실행코드
       command = f'python inference_img.py --img "{last_frame}" "{first_frame}" --exp=4'
    #    command = f'python inference_img.py --img "{last_frame}" "{first_frame}" --exp=1 --scale=2.0'
       os.system(command)
       
       for i in range(16):
           src = f"output/img{i}.png"
           dst = f"{output_dir}/frame_{i:04d}.png"
           if os.path.exists(src):
               os.rename(src, dst)

   def create_final_video(self, words: List[str], fps: float, size: tuple, output_path: str):
       """최종 영상 생성"""
       width, height = size
       out = cv2.VideoWriter(output_path, 
                           cv2.VideoWriter_fourcc(*'mp4v'),
                           fps, 
                           (width, height))
       
       for i, word in enumerate(words):
           # 현재 단어의 프레임 추가
           safe_word = self.get_safe_name(word)
           word_dir = f"{self.output_dir}/words/{safe_word}"
           frame_files = sorted([f for f in os.listdir(word_dir) if f.startswith("frame_")])
           
           for frame_file in frame_files:
               frame = cv2.imread(os.path.join(word_dir, frame_file))
               if frame is not None:
                   frame = cv2.resize(frame, (width, height))
                   out.write(frame)
           
           # 보간 프레임 추가
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

   def process_sentence(self, words: List[str], video_paths: List[str], output_path: str):
       """전체 과정 실행"""
       try:
           # output 디렉토리가 있다면 먼저 삭제
           if os.path.exists("output"):
               import shutil
               shutil.rmtree("output")
           os.makedirs("output")
           
           fps = None
           size = None
           
           # 1. 프레임 추출
           for word, video_path in zip(words, video_paths):
               curr_fps, curr_size = self.extract_all_frames(video_path, word)
               if fps is None:
                   fps = curr_fps
                   size = curr_size

           # 2. 보간 수행
           for i in range(len(words)-1):
               print(f"보간 처리 중: {words[i]} -> {words[i+1]}")
               self.interpolate_frames(words[i], words[i+1])

           # 3. 최종 영상 생성
           self.create_final_video(words, fps, size, output_path)

       except Exception as e:
           print(f"처리 중 오류 발생: {str(e)}")
           import traceback
           traceback.print_exc()
       finally:
           # 4. 임시 파일 정리
           if os.path.exists("output"):
               import shutil
               shutil.rmtree("output")

def main():
   try:
       # 작업 디렉토리 생성
       os.makedirs("videos", exist_ok=True)
       
       # 입력 문장
       sentence = "대면 당회 데살로니가"
    #    sentence = "평화공세 평화공존 평화기구 두루마리"
       words = sentence.split()
       
       # 각 단어에 해당하는 비디오 경로
    #    video_paths = [
    #        "videos/대면.mp4",
    #        "videos/당회.mp4",
    #        "videos/데살로니가.mp4",
    #    ]
       video_paths = [
           "videos/1001_평화공세.mp4",
        #    "videos/1002_평화공존.mp4",
           "videos/1003_평화기구.mp4",
           "videos/10005_두루마리.mp4",
       ]
       
       # 비디오 파일 존재 확인
       for path in video_paths:
           if not os.path.exists(path):
               print(f"Error: 비디오 파일을 찾을 수 없습니다: {path}")
               return
       
       connector = VideoConnector()
       connector.process_sentence(words, video_paths, "final_video2.mp4")
       
   except Exception as e:
       print(f"Error occurred: {str(e)}")
       import traceback
       traceback.print_exc()

if __name__ == "__main__":
   main()