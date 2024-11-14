import json
import csv

# JSON 문자열을 파이썬 객체로 변환하는 함수
def clean_json_string(json_str):
    # 주석 제거
    import re
    json_str = re.sub(r'//.*?\n', '\n', json_str)
    return json_str

def convert_to_csv():
    # 파일에서 데이터 읽기
    with open('paste.txt', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # JSON 형식으로 정리
    cleaned_content = clean_json_string(content)
    data = json.loads(cleaned_content)
    
    # 모든 형태소를 하나의 리스트로 평탄화
    morphemes = []
    for item in data:
        morphemes.extend(item)
    
    # 중복 제거 및 정렬 (선택사항)
    morphemes = sorted(list(set(morphemes)))
    
    # CSV 파일로 저장
    with open('BankPage_morphemes.csv', 'w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['형태소'])  # 헤더
        for morpheme in morphemes:
            writer.writerow([morpheme])

    print("CSV 파일이 생성되었습니다: BankPage_morphemes.csv")

# 스크립트 실행
if __name__ == "__main__":
    convert_to_csv()