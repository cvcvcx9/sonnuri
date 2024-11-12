import cv2
import mediapipe as mp
import numpy as np
import os
import hashlib
import subprocess
from typing import List, Tuple

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
            max_num_hands=2,
            min_detection_confidence=0.5
        )

    def get_safe_name(self, word: str) -> str:
        """한글 단어를 안전한 파일명으로 변환"""
        return hashlib.md5(word.encode()).hexdigest()

    def extract_hand_landmarks(self, frame) -> List[List[Tuple[float, float, float]]]:
        """프레임에서 손 랜드마크 추출"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        landmarks_list = []
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                landmarks = [(landmark.x, landmark.y, landmark.z) for landmark in hand_landmarks.landmark]
                landmarks_list.append(landmarks)
        
        return landmarks_list

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
            cv2.imwrite(frame_path, frame)
        
        cap.release()
        
        landmark_path = f"{word_dir}/landmarks.npy"
        np.save(landmark_path, np.array(landmarks_data, dtype=object))
        
        return fps, (width, height), len(frames)

    def interpolate_frames(self, word1: str, word2: str, steps: int = 50):
        """두 단어 사이의 프레임 보간 및 크로스페이드"""
        safe_word1 = self.get_safe_name(word1)
        safe_word2 = self.get_safe_name(word2)
        
        landmarks1 = np.load(f"{self.output_dir}/words/{safe_word1}/landmarks.npy", allow_pickle=True)
        landmarks2 = np.load(f"{self.output_dir}/words/{safe_word2}/landmarks.npy", allow_pickle=True)
        
        last_frame = cv2.imread(f"{self.output_dir}/words/{safe_word1}/frame_{len(landmarks1)-1:04d}.png")
        first_frame = cv2.imread(f"{self.output_dir}/words/{safe_word2}/frame_0000.png")
        
        height, width = last_frame.shape[:2]
        output_dir = f"{self.output_dir}/interpolated/{safe_word1}_{safe_word2}"
        os.makedirs(output_dir, exist_ok=True)

        for i in range(steps):
            t = i / (steps - 1)
            crossfaded_frame = cv2.addWeighted(last_frame, 1 - t, first_frame, t, 0)
            cv2.imwrite(f"{output_dir}/frame_{i:04d}.png", crossfaded_frame)

    def create_final_video(self, words: List[str], fps: float, size: tuple, output_path: str):
        width, height = size
        out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps * 2, (width, height))
        
        for i, word in enumerate(words):
            safe_word = self.get_safe_name(word)
            word_dir = f"{self.output_dir}/words/{safe_word}"
            frame_files = sorted([f for f in os.listdir(word_dir) if f.startswith("frame_")])
            
            for frame_file in frame_files:
                frame = cv2.imread(os.path.join(word_dir, frame_file))
                frame = cv2.resize(frame, (width, height))
                out.write(frame)
                out.write(frame)
            
            if i < len(words) - 1:
                safe_word_next = self.get_safe_name(words[i+1])
                interp_dir = f"{self.output_dir}/interpolated/{safe_word}_{safe_word_next}"
                interp_files = sorted([f for f in os.listdir(interp_dir) if f.startswith("frame_")])
                for interp_file in interp_files:
                    frame = cv2.imread(os.path.join(interp_dir, interp_file))
                    frame = cv2.resize(frame, (width, height))
                    out.write(frame)
        
        out.release()

    def apply_rife(self, input_folder: str, output_path: str):
        """RIFE를 사용하여 중간 프레임 생성 및 최종 영상을 만듭니다."""
        rife_command = [
            "python", "inference_img.py",
            "--exp=2",  # 보간 배율
            "--img_folder", input_folder,
            "--output", output_path
        ]
        subprocess.run(rife_command)

    def process_sentence(self, words: List[str], video_paths: List[str], output_path: str):
        try:
            if os.path.exists("output"):
                import shutil
                shutil.rmtree("output")
            os.makedirs("output")
            
            fps = None
            size = None
            
            for word, video_path in zip(words, video_paths):
                curr_fps, curr_size, _ = self.extract_all_frames(video_path, word)
                if fps is None:
                    fps = curr_fps
                    size = curr_size

            for i in range(len(words) - 1):
                self.interpolate_frames(words[i], words[i+1])

            self.create_final_video(words, fps, size, "intermediate_video.mp4")
            self.apply_rife("temp_frames/interpolated", output_path)

        except Exception as e:
            print(f"처리 중 오류 발생: {str(e)}")
            import traceback
            traceback.print_exc()
        finally:
            if os.path.exists("output"):
                import shutil
                shutil.rmtree("output")

def main():
    sentence = "정맥주사 중환자실"
    words = sentence.split()
    
    video_paths = [
        "videos/10087_정맥주사.mp4",
        "videos/10097_중환자실.mp4",
    ]
    
    for path in video_paths:
        if not os.path.exists(path):
            print(f"Error: 비디오 파일을 찾을 수 없습니다: {path}")
            return
    
    connector = VideoConnector()
    connector.process_sentence(words, video_paths, "final_video_with_rife.mp4")

if __name__ == "__main__":
    main()
