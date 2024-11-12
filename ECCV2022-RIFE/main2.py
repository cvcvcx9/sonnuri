import cv2
import os
from typing import List
import hashlib
import numpy as np

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
       
       print(f"비디오 {word}에서 {len(frames)}개의 프레임 추출 완료")
       self.word_to_safe[word] = safe_word  # 매핑 저장
       return fps, (width, height), len(frames)

   def get_last_n_frames(self, word: str, n: int) -> List[str]:
       """단어의 마지막 n개 프레임 경로 가져오기"""
       safe_word = self.get_safe_name(word)
       word_dir = f"{self.output_dir}/words/{safe_word}"
       frame_files = sorted([f for f in os.listdir(word_dir) if f.startswith("frame_")])
       return [os.path.join(word_dir, f) for f in frame_files[-n:]]

   def get_first_n_frames(self, word: str, n: int) -> List[str]:
       """단어의 처음 n개 프레임 경로 가져오기"""
       safe_word = self.get_safe_name(word)
       word_dir = f"{self.output_dir}/words/{safe_word}"
       frame_files = sorted([f for f in os.listdir(word_dir) if f.startswith("frame_")])
       return [os.path.join(word_dir, f) for f in frame_files[:n]]

   def interpolate_multi_frames(self, word1: str, word2: str, n_frames: int = 3):
        """여러 프레임을 고려한 보간"""
        # 각 단어의 프레임들 가져오기
        last_frames = self.get_last_n_frames(word1, n_frames)
        first_frames = self.get_first_n_frames(word2, n_frames)
        
        safe_word1 = self.get_safe_name(word1)
        safe_word2 = self.get_safe_name(word2)
        output_dir = f"{self.output_dir}/interpolated/{safe_word1}_{safe_word2}"
        os.makedirs(output_dir, exist_ok=True)
        
        # 각 프레임 쌍에 대해 보간 수행
        all_interpolated = []
        for i, last_frame in enumerate(last_frames):
            for j, first_frame in enumerate(first_frames):
                # 임시 디렉토리 생성
                temp_dir = f"{output_dir}/temp_{i}_{j}"
                os.makedirs(temp_dir, exist_ok=True)
                
                # 보간 수행 (scale 파라미터 제거)
                command = f'python inference_img.py --img "{last_frame}" "{first_frame}" --exp=4'
                print(f"실행 명령어: {command}")  # 디버깅을 위해 명령어 출력
                result = os.system(command)
                print(f"명령어 실행 결과: {result}")  # 실행 결과 출력
                
                # output 디렉토리의 내용 확인
                if os.path.exists("output"):
                    print(f"output 디렉토리 내용: {os.listdir('output')}")
                
                # 보간된 프레임들 이동
                for k in range(16):  # exp=4 -> 16개 프레임
                    src = f"output/img{k}.png"
                    dst = f"{temp_dir}/frame_{k:04d}.png"
                    if os.path.exists(src):
                        os.rename(src, dst)
                        all_interpolated.append(dst)
                    else:
                        print(f"경고: {src} 파일이 존재하지 않습니다.")
            
            # 중간 점검
            print(f"현재까지 생성된 보간 프레임 수: {len(all_interpolated)}")
        
        if not all_interpolated:
            raise ValueError(f"보간된 프레임이 생성되지 않았습니다. 마지막 프레임: {last_frames}, 첫 프레임: {first_frames}")
        
        # 블렌딩 수행
        self.blend_frames(all_interpolated, output_dir)

   def blend_frames(self, frame_paths: List[str], output_dir: str):
       """여러 보간 프레임들을 블렌딩"""
       n_output_frames = 16  # 최종 보간 프레임 수
       
       # 모든 프레임 로드
       frames = []
       for path in frame_paths:
           frame = cv2.imread(path)
           if frame is not None:
               frames.append(frame)
       
       if not frames:
           raise ValueError("블렌딩할 프레임이 없습니다.")
       
       # 각 타임스텝에 대해 블렌딩
       for i in range(n_output_frames):
           # 현재 타임스텝의 가중치 계산
           t = i / (n_output_frames - 1)
           
           # 모든 프레임의 가중 평균 계산
           blended = np.zeros_like(frames[0], dtype=float)
           weight_sum = 0
           
           for j, frame in enumerate(frames):
               # 각 프레임의 가중치 계산 (시간에 따른 가우시안 가중치)
               frame_t = j / (len(frames) - 1)
               weight = np.exp(-50 * (t - frame_t) ** 2)  # 가우시안 가중치
               blended += frame * weight
               weight_sum += weight
           
           # 정규화 및 저장
           if weight_sum > 0:
               blended = np.clip(blended / weight_sum, 0, 255).astype(np.uint8)
               output_path = f"{output_dir}/frame_{i:04d}.png"
               cv2.imwrite(output_path, blended)

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
               curr_fps, curr_size, _ = self.extract_all_frames(video_path, word)
               if fps is None:
                   fps = curr_fps
                   size = curr_size

           # 2. 향상된 보간 수행
           for i in range(len(words)-1):
               print(f"보간 처리 중: {words[i]} -> {words[i+1]}")
               self.interpolate_multi_frames(words[i], words[i+1], n_frames=3)

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
       sentence = "대면 당화 데살로니가"
       words = sentence.split()
       
       # 각 단어에 해당하는 비디오 경로
       video_paths = [
           "videos/대면.mp4",
           "videos/당회.mp4",
           "videos/데살로니가.mp4",
       ]
       
       # 비디오 파일 존재 확인
       for path in video_paths:
           if not os.path.exists(path):
               print(f"Error: 비디오 파일을 찾을 수 없습니다: {path}")
               return
       
       connector = VideoConnector()
       connector.process_sentence(words, video_paths, "final_video.mp4")
       
   except Exception as e:
       print(f"Error occurred: {str(e)}")
       import traceback
       traceback.print_exc()

if __name__ == "__main__":
   main()