import numpy as np
import cv2
import json
import os
from .helpers import make_dir

def create_stick(filename, keypoints, save_path):
    """이미지 생성 함수"""
    # 절대 경로로 변환
    save_path = os.path.abspath(save_path)
    
    print(f"Absolute save path: {save_path}")
    
    # 키포인트 페어 정의
    pose_point_pair = [[1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 7], [2, 9], [9, 8], [8, 10], [10, 5]]

    face_point_pair = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], 
        [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16], [17, 18], [18, 19], 
        [19, 20], [20, 21], [22, 23], [23, 24], [24, 25], [25, 26], [27, 28], [28, 29], 
        [29, 30], [30, 31], [31, 32], [32, 33], [33, 34], [34, 35], [36, 37], [37, 38], 
        [38, 39], [39, 40], [40, 41], [36, 41], [42, 43], [43, 44], [44, 45], [45, 46], 
        [46, 47], [42, 47], [48, 49], [49, 50], [50, 51], [51, 52], [52, 53], [53, 54], 
        [54, 55], [55, 56], [56, 57], [57, 58], [58, 59], [48, 59], [60, 61], [61, 62], [62, 63], [63, 64]
    ]

    hand_point_pair = [[i, i+1] for i in range(0, 20)]


    # 디렉토리 생성
    try:
        os.makedirs(save_path, exist_ok=True)
        print(f"Directory created/verified: {save_path}")
    except Exception as e:
        print(f"Failed to create directory: {str(e)}")
        return

    # 디렉토리 권한 확인
    if not os.access(save_path, os.W_OK):
        print(f"No write permission for directory: {save_path}")
        return
        
    try:
        for keypoint in range(len(keypoints)):
            pose = keypoints[keypoint][:22]
            face = keypoints[keypoint][30:170]
            left_hand = keypoints[keypoint][170:212]
            right_hand = keypoints[keypoint][212:255]

            part = [pose, face, left_hand, right_hand]
            part_num_points = [11, 68, 21, 21]
            part_pair = [pose_point_pair, face_point_pair, hand_point_pair, hand_point_pair]

            # Create paper (3채널 이미지)
            img = np.zeros((1500, 1500, 3), np.uint8) + 255

            for p in range(len(part)):
                x = part[p][0::2]
                y = part[p][1::2]

                # Draw points
                for i in range(part_num_points[p]):
                    cv2.circle(img, (int(x[i]*2048), int(y[i]*1152)), 2, (0, 255, 255), thickness=-1, lineType=cv2.FILLED)  
                
                # Draw lines
                for pair in part_pair[p]:
                    cv2.line(img, (int(x[pair[0]]*2048), int(y[pair[0]]*1152)), 
                            (int(x[pair[1]]*2048), int(y[pair[1]]*1152)), (0, 0, 255), 2)
            
            # 파일명 생성
            output_filename = f'{filename[:-5]}_{keypoint:03}.jpg'
            save_file_path = os.path.join(save_path, output_filename)
            
            print(f"\nAttempting to save frame {keypoint}:")
            print(f"Output filename: {output_filename}")
            print(f"Full save path: {save_file_path}")
            
            try:
                # 이미지가 유효한지 확인
                if img is None or img.size == 0:
                    print("Error: Image is empty or invalid")
                    continue
                
                # PIL을 사용하여 이미지 저장 시도
                from PIL import Image
                pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                pil_img.save(save_file_path, 'JPEG', quality=95)
                
                if os.path.exists(save_file_path):
                    print(f"Successfully saved image: {output_filename}")
                    print(f"File size: {os.path.getsize(save_file_path)} bytes")
                else:
                    print(f"Failed to save image: {save_file_path}")
                
            except Exception as save_error:
                print(f"Error while saving image: {str(save_error)}")
                print(f"Current working directory: {os.getcwd()}")
                raise
            
            # 이미지 화면에 표시
            # cv2.imshow(f'Frame {keypoint}', img)
            # cv2.waitKey(1000)  # 1초간 표시
            
    except Exception as e:
        print(f"Error in create_stick: {str(e)}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Save path exists: {os.path.exists(save_path)}")
        print(f"Save path is writable: {os.access(save_path, os.W_OK)}")
        raise
    finally:
        cv2.destroyAllWindows()

def create_video(save_path):
    """비디오 생성 함수"""
    try:
        # 경로 정규화
        save_path = os.path.normpath(save_path)
        
        # Load stick images
        images = [img for img in os.listdir(save_path) if img.endswith('.jpg')]
        if not images:
            print(f"No jpg images found in {save_path}")
            return
            
        images.sort()
        print(f"Found {len(images)} images in {save_path}")

        # Read first image to get dimensions
        first_img = cv2.imread(os.path.join(save_path, images[0]))
        if first_img is None:
            print(f"Failed to read first image: {images[0]}")
            return
            
        height, width, layers = first_img.shape
        size = (width, height)
        fps = 30

        # Prepare video writer
        output_filename = str(images[0])[:-8] + '.mp4'
        output_path = os.path.normpath(os.path.join(save_path, output_filename))
        out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'DIVX'), fps, size)

        # Write frames
        frame_array = []
        for img_name in images:
            img_path = os.path.join(save_path, img_name)
            img = cv2.imread(img_path)
            if img is not None:
                frame_array.append(img)
            else:
                print(f"Failed to read image: {img_name}")

        for frame in frame_array:
            out.write(frame)

        out.release()
        print(f"Video created successfully: {output_filename}")
        
    except Exception as e:
        print(f"Error in create_video: {str(e)}")
        print(f"Save path: {save_path}")
        print(f"Directory contents: {os.listdir(save_path) if os.path.exists(save_path) else 'Directory not found'}")
        raise

def create_img_video(file_path, save_path, filename): 
    try:
        # 절대 경로로 변환
        file_path = os.path.abspath(file_path)
        save_path = os.path.abspath(save_path)
        
        print(f"\nProcessing file: {filename}")
        print(f"Absolute file path: {file_path}")
        print(f"Absolute save path: {save_path}")
        
        # JSON 파일 읽기
        json_file_path = os.path.join(file_path, filename)
        if not os.path.exists(json_file_path):
            print(f"JSON file not found: {json_file_path}")
            return
            
        with open(json_file_path, encoding="UTF-8") as f:
            keypoints = json.loads(f.read())

        # 저장 경로 생성
        save_dir = os.path.join(save_path, filename[:-5])
        os.makedirs(save_dir, exist_ok=True)
        print(f"Created/verified directory: {save_dir}")

        # 이미지 생성
        create_stick(filename, keypoints, save_dir)
        
        # 비디오 생성
        create_video(save_dir)
        
        print(f"Completed processing: {filename}\n")
        
    except Exception as e:
        print(f"Error in create_img_video: {str(e)}")
        print(f"Working directory: {os.getcwd()}")
        raise