import os
import json

# 최상위 디렉토리 경로
top_directory = r"C:\Users\SSAFY\Desktop\수어데이터"

# 단어를 저장할 집합 (중복 제거 위해 집합 사용)
words_set = set()

# '01'부터 '16'까지의 하위 폴더 탐색
for i in range(1, 17):
    subfolder = f"{i:02}"  # '01', '02', ... , '16' 형식으로 폴더 이름 생성
    subfolder_path = os.path.join(top_directory, subfolder)
    
    if os.path.isdir(subfolder_path):  # 하위 폴더인지 확인
        # 하위 폴더 내 JSON 파일 탐색
        for filename in os.listdir(subfolder_path):
            if filename.endswith(".json"):  # JSON 파일만 선택
                filepath = os.path.join(subfolder_path, filename)
                
                # JSON 파일 열기
                with open(filepath, "r", encoding="utf-8") as file:
                    data = json.load(file)
                    
                    # data 필드 내 name 속성 가져오기
                    for entry in data.get("data", []):
                        for attribute in entry.get("attributes", []):
                            word = attribute.get("name")
                            if word:
                                words_set.add(word)

# 추출한 단어 리스트로 변환 및 정렬
words_list = sorted(list(words_set))

# 결과를 텍스트 파일로 저장
output_file = r"C:\Users\SSAFY\Desktop\extracted_words.txt"
with open(output_file, "w", encoding="utf-8") as file:
    for word in words_list:
        file.write(word + "\n")

print(f"Extracted words have been saved to {output_file}")
