import os
import cv2
import numpy as np
from PIL import Image

def check_image_format(data_dir):
    """
    디렉토리 내의 이미지 파일들의 형식을 확인합니다.
    
    Args:
        data_dir (str): 확인할 디렉토리 경로
    """
    print(f"\nChecking images in: {data_dir}")
    
    # 디렉토리 내 파일 목록 가져오기
    files = [f for f in os.listdir(data_dir) if f.endswith(('.png', '.jpg', '.jpeg'))]
    
    if not files:
        print("No image files found!")
        return
        
    print(f"Total files found: {len(files)}")
    
    # 첫 번째 파일 자세히 분석
    first_file = files[0]
    first_file_path = os.path.join(data_dir, first_file)
    
    # OpenCV로 읽기
    img_cv = cv2.imread(first_file_path, cv2.IMREAD_UNCHANGED)
    if img_cv is not None:
        print(f"\nFirst file ({first_file}) details:")
        print(f"Shape (height, width, channels): {img_cv.shape}")
        print(f"Data type: {img_cv.dtype}")
        print(f"Min value: {img_cv.min()}")
        print(f"Max value: {img_cv.max()}")
        print(f"Unique values: {np.unique(img_cv).shape[0]}")
    
    # PIL로도 확인
    try:
        img_pil = Image.open(first_file_path)
        print(f"\nPIL Image details:")
        print(f"Format: {img_pil.format}")
        print(f"Mode: {img_pil.mode}")
        print(f"Size: {img_pil.size}")
        img_pil.close()
    except Exception as e:
        print(f"Error reading with PIL: {e}")

    # 모든 파일의 형식이 동일한지 확인
    print("\nChecking all files for consistency...")
    shapes = set()
    for file in files:
        img = cv2.imread(os.path.join(data_dir, file), cv2.IMREAD_UNCHANGED)
        if img is not None:
            shapes.add(str(img.shape))
    
    print(f"Found {len(shapes)} different shapes: {shapes}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--dir', required=True, help='Path to image directory')
    args = parser.parse_args()
    
    check_image_format(args.dir)