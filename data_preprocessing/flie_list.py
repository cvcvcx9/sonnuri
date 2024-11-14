import os
import csv

# 파일 목록을 가져올 폴더 경로 지정
folder_path = "G:/공유 드라이브/수어사전데이터/videos/trimming_videos"  # 원하는 폴더 경로로 변경

# 파일 목록을 가져옴
file_list = os.listdir(folder_path)

# CSV 파일로 저장
with open("file_list.csv", "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["File Name"])  # CSV 헤더 작성
    for file_name in file_list:
        writer.writerow([file_name])

print("CSV 파일 생성 완료: file_list.csv")
