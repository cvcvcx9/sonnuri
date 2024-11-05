import os
import cv2
import numpy as np

def load_opencv_yml(yml_path):
    """OpenCV YAML 파일에서 키포인트 데이터를 로드합니다."""
    fs = cv2.FileStorage(yml_path, cv2.FILE_STORAGE_READ)
    
    # face_0 노드 읽기
    face_node = fs.getNode('face_0')
    
    if not face_node.empty():
        # 데이터를 numpy 배열로 변환
        data = face_node.mat()
        # 데이터 형태 출력
        print(f"Loaded data shape: {data.shape}")
        # 형상이 (1, 70, 3)인 경우 (70, 3)으로 변환
        if len(data.shape) == 3:
            data = data.reshape(-1, 3)
        print(f"Reshaped data shape: {data.shape}")
        return data
    
    fs.release()
    return None

def create_pose_channels(keypoints, image_size=(1024, 512)):
    """키포인트로부터 36채널 포즈 맵을 생성합니다."""
    channels = np.zeros((image_size[1], image_size[0], 36), dtype=np.float32)
    
    if keypoints is None:
        return channels
    
    print(f"Processing {len(keypoints)} keypoints")
    
    # 얼굴 키포인트를 채널에 매핑
    for i, point in enumerate(keypoints):
        x, y, conf = point
        print(f"Processing point {i}: x={x}, y={y}, conf={conf}")
        
        if conf > 0.1:  # confidence threshold
            # 가우시안 히트맵 생성
            sigma = 7  # 시그마 값을 증가시켜 더 잘 보이게 함
            x, y = int(x), int(y)
            
            # 채널 선택 (36채널로 제한)
            channel_idx = min(i % 36, 35)
            
            # 유효한 범위 계산
            y_min = max(0, y-sigma*3)
            y_max = min(image_size[1], y+sigma*3+1)
            x_min = max(0, x-sigma*3)
            x_max = min(image_size[0], x+sigma*3+1)
            
            if x_min >= x_max or y_min >= y_max:
                continue
                
            # 가우시안 히트맵 생성
            x_grid, y_grid = np.meshgrid(
                np.arange(x_min, x_max),
                np.arange(y_min, y_max)
            )
            gaussian = np.exp(-((x_grid-x)**2 + (y_grid-y)**2) / (2*sigma**2))
            
            # 히트맵 적용
            channels[y_min:y_max, x_min:x_max, channel_idx] = np.maximum(
                channels[y_min:y_max, x_min:x_max, channel_idx],
                gaussian * conf * 1.0  # 강도를 증가시킴
            )
    
    return channels

def process_keypoints(input_dir, output_dir):
    """모든 OpenCV YML 파일을 처리하여 36채널 레이블 이미지로 변환합니다."""
    os.makedirs(output_dir, exist_ok=True)
    
    yml_files = [f for f in os.listdir(input_dir) if f.endswith('.yml')]
    total_files = len(yml_files)
    
    print(f"Found {total_files} YML files")
    
    for i, yml_file in enumerate(yml_files, 1):
        print(f"\nProcessing {yml_file} ({i}/{total_files})...")
        
        # YML 파일 로드
        input_path = os.path.join(input_dir, yml_file)
        keypoints = load_opencv_yml(input_path)
        
        if keypoints is not None:
            # 36채널 포즈 맵 생성
            pose_channels = create_pose_channels(keypoints)
            
            # NPY 파일로 저장
            output_base = os.path.splitext(yml_file)[0].replace('_face', '')
            output_path = os.path.join(output_dir, f"{output_base}.npy")
            np.save(output_path, pose_channels)
            
            # 시각화 이미지 저장
            vis_path = os.path.join(output_dir, f"{output_base}_vis.png")
            visualization = np.max(pose_channels, axis=2)
            
            # 시각화 향상
            visualization = (visualization * 255).astype(np.uint8)
            # 대비 향상
            visualization = cv2.equalizeHist(visualization)
            
            # 컬러맵 적용
            visualization_color = cv2.applyColorMap(visualization, cv2.COLORMAP_JET)
            
            # 저장
            cv2.imwrite(vis_path, visualization)
            cv2.imwrite(vis_path.replace('.png', '_color.png'), visualization_color)
            
            print(f"Saved to {output_base}.npy and visualization files")
            
            # 채널 통계 출력
            print(f"Channels min: {pose_channels.min()}, max: {pose_channels.max()}, mean: {pose_channels.mean()}")
        else:
            print(f"Failed to load keypoints from {yml_file}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--input_dir', required=True, help='Directory containing OpenCV YML files')
    parser.add_argument('--output_dir', required=True, help='Output directory for label images')
    
    args = parser.parse_args()
    process_keypoints(args.input_dir, args.output_dir)