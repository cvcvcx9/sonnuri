import pandas as pd
import os

def check_missing_files():
    # CSV 파일 경로
    csv_path = "C:/Users/SSAFY/Desktop/A301/parsed_morphemes.csv"
    data = pd.read_csv(csv_path, encoding='cp949')
    
    missing_files = []
    total_files = 0
    
    # 각 행에 대해 비디오 파일 존재 여부 체크
    for _, row in data.iterrows():
        형태소 = row['형태소']
        files = eval(row['파일'])  # 문자열로 되어 있는 리스트를 리스트로 변환
        new_num = row['번호']
        
        # 파일 경로 목록 생성 및 체크
        for file in files:
            total_files += 1
            video_path = f"C:/Users/SSAFY/Desktop/A301/downloaded_videos/{file}.mp4"
            if not os.path.exists(video_path):
                missing_files.append({
                    '번호': new_num,
                    '형태소': 형태소,
                    '파일명': f"{file}.mp4",
                    '전체경로': video_path
                })
    
    # 결과 출력
    print(f"\n전체 파일 수: {total_files}")
    print(f"누락된 파일 수: {len(missing_files)}")
    
    if missing_files:
        print("\n=== 누락된 파일 목록 ===")
        for file_info in missing_files:
            print(f"\n번호: {file_info['번호']}")
            print(f"형태소: {file_info['형태소']}")
            print(f"파일명: {file_info['파일명']}")
            print(f"경로: {file_info['전체경로']}")
        
        # 누락된 파일 목록을 CSV로 저장
        missing_df = pd.DataFrame(missing_files)
        missing_df.to_csv("missing_files.csv", index=False, encoding='utf-8-sig')
        print("\n누락된 파일 목록이 'missing_files.csv'에 저장되었습니다.")

if __name__ == "__main__":
    check_missing_files()