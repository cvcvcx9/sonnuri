import cv2
import mediapipe as mp
import numpy as np
import os
from typing import List, Tuple, Optional
import hashlib

class VideoConnector:
   def __init__(self, output_dir: str = "temp_frames"):
       self.output_dir = output_dir
       self.word_to_safe = {}
       os.makedirs(output_dir, exist_ok=True)
       os.makedirs(f"{output_dir}/words", exist_ok=True)
       os.makedirs(f"{output_dir}/interpolated", exist_ok=True)
       
       # MediaPipe 초기화
       self.mp_hands = mp.solutions.hands
       self.hands = self.mp_hands.Hands(
           static_image_mode=False,
           max_num_hands=2,  # 수어는 양손을 사용할 수 있으므로 2로 설정
           min_detection_confidence=0.5
       )

   def get_safe_name(self, word: str) -> str:
       """한글 단어를 안전한 파일명으로 변환"""
       return hashlib.md5(word.encode()).hexdigest()

   def extract_hand_landmarks(self, frame) -> Optional[List[Tuple[float, float, float]]]:
       """프레임에서 손 랜드마크 추출"""
       rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
       results = self.hands.process(rgb_frame)
       
       if results.multi_hand_landmarks:
           landmarks_list = []
           for hand_landmarks in results.multi_hand_landmarks:
               landmarks = []
               for landmark in hand_landmarks.landmark:
                   landmarks.append((landmark.x, landmark.y, landmark.z))
               landmarks_list.append(landmarks)
           return landmarks_list
       return None

   def extract_all_frames(self, video_path: str, word: str) -> tuple:
       """비디오의 모든 프레임과 손 랜드마크 추출"""
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
       landmarks_data = []
       
       while True:
           ret, frame = cap.read()
           if not ret:
               break
           
           frames.append(frame)
           landmarks = self.extract_hand_landmarks(frame)
           landmarks_data.append(landmarks)
           
           frame_count = len(frames) - 1
           frame_path = f"{word_dir}/frame_{frame_count:04d}.png"
           success = cv2.imwrite(frame_path, frame)
           if not success:
               raise ValueError(f"프레임 저장 실패: {frame_path}")
       
       cap.release()
       
       print(f"비디오 {word}에서 {len(frames)}개의 프레임 추출 완료")
       self.word_to_safe[word] = safe_word
       
       # 랜드마크 데이터 저장
       landmark_path = f"{word_dir}/landmarks.npy"
       np.save(landmark_path, landmarks_data)
       
       return fps, (width, height), len(frames)

   def interpolate_landmarks(self, landmarks1: List, landmarks2: List, steps: int = 16) -> List:
       """두 프레임 간의 손 랜드마크 보간"""
       if not landmarks1 or not landmarks2:
           return [None] * steps
           
       interpolated = []
       for i in range(steps):
           ratio = i / (steps - 1)
           frame_landmarks = []
           
           # 각 손에 대해 보간
           for hand1, hand2 in zip(landmarks1, landmarks2):
               if hand1 and hand2:
                   hand_points = []
                   for p1, p2 in zip(hand1, hand2):
                       interp_point = tuple(np.array(p1) * (1 - ratio) + np.array(p2) * ratio)
                       hand_points.append(interp_point)
                   frame_landmarks.append(hand_points)
           
           interpolated.append(frame_landmarks if frame_landmarks else None)
       
       return interpolated

   def interpolate_frames(self, word1: str, word2: str):
       """두 단어 사이의 프레임과 랜드마크 보간"""
       safe_word1 = self.get_safe_name(word1)
       safe_word2 = self.get_safe_name(word2)
       
       # 랜드마크 데이터 로드
       landmarks1 = np.load(f"{self.output_dir}/words/{safe_word1}/landmarks.npy", allow_pickle=True)
       landmarks2 = np.load(f"{self.output_dir}/words/{safe_word2}/landmarks.npy", allow_pickle=True)
       
       # 마지막 프레임과 첫 프레임의 랜드마크 보간
       last_landmarks = landmarks1[-1]
       first_landmarks = landmarks2[0]
       interpolated_landmarks = self.interpolate_landmarks(last_landmarks, first_landmarks)
       
       # 이미지 보간
       last_frame = f"{self.output_dir}/words/{safe_word1}/frame_{len(landmarks1)-1:04d}.png"
       first_frame = f"{self.output_dir}/words/{safe_word2}/frame_0000.png"
       
       output_dir = f"{self.output_dir}/interpolated/{safe_word1}_{safe_word2}"
       os.makedirs(output_dir, exist_ok=True)
       
       # RIFE를 사용한 프레임 보간
       command = f'python inference_img.py --img "{last_frame}" "{first_frame}" --exp=4'
       os.system(command)
       
       # 보간된 프레임과 랜드마크 저장
       for i in range(16):
           src = f"output/img{i}.png"
           dst = f"{output_dir}/frame_{i:04d}.png"
           if os.path.exists(src):
               os.rename(src, dst)
       
       # 랜드마크 데이터 저장
       np.save(f"{output_dir}/landmarks.npy", interpolated_landmarks)

   def create_final_video(self, words: List[str], fps: float, size: tuple, output_path: str):
       """최종 영상 생성 (랜드마크 시각화 포함)"""
       width, height = size
       out = cv2.VideoWriter(output_path, 
                           cv2.VideoWriter_fourcc(*'mp4v'),
                           fps, 
                           (width, height))
       
       mp_drawing = mp.solutions.drawing_utils
       
       for i, word in enumerate(words):
           safe_word = self.get_safe_name(word)
           word_dir = f"{self.output_dir}/words/{safe_word}"
           
           # 원본 프레임 추가
           frame_files = sorted([f for f in os.listdir(word_dir) if f.startswith("frame_")])
           landmarks_data = np.load(f"{word_dir}/landmarks.npy", allow_pickle=True)
           
           for j, frame_file in enumerate(frame_files):
               frame = cv2.imread(os.path.join(word_dir, frame_file))
               if frame is not None:
                   # 랜드마크 시각화
                   if landmarks_data[j] is not None:
                       frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                       for hand_landmarks in landmarks_data[j]:
                           for landmark in hand_landmarks:
                               x, y = int(landmark[0] * width), int(landmark[1] * height)
                               cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)
                   
                   frame = cv2.resize(frame, (width, height))
                   out.write(frame)
           
           # 보간 프레임 추가
           if i < len(words) - 1:
               safe_word_next = self.get_safe_name(words[i+1])
               interp_dir = f"{self.output_dir}/interpolated/{safe_word}_{safe_word_next}"
               
               if os.path.exists(interp_dir):
                   interp_files = sorted([f for f in os.listdir(interp_dir) if f.startswith("frame_")])
                   landmarks_data = np.load(f"{interp_dir}/landmarks.npy", allow_pickle=True)
                   
                   for j, interp_file in enumerate(interp_files):
                       frame = cv2.imread(os.path.join(interp_dir, interp_file))
                       if frame is not None:
                           # 보간된 랜드마크 시각화
                           if landmarks_data[j] is not None:
                               for hand_landmarks in landmarks_data[j]:
                                   for landmark in hand_landmarks:
                                       x, y = int(landmark[0] * width), int(landmark[1] * height)
                                       cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)
                           
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
           
           # 1. 프레임과 랜드마크 추출
           for word, video_path in zip(words, video_paths):
               curr_fps, curr_size, _ = self.extract_all_frames(video_path, word)
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
       connector.process_sentence(words, video_paths, "final_video3.mp4")
       
   except Exception as e:
       print(f"Error occurred: {str(e)}")
       import traceback
       traceback.print_exc()

if __name__ == "__main__":
   main()