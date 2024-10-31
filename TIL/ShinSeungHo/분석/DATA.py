import requests
import pandas as pd
import time
import os
import xml.etree.ElementTree as ET

# 현재 작업 디렉토리 확인
print("Current working directory:", os.getcwd())

# API 기본 URL과 파라미터 설정
base_url = "http://api.kcisa.kr/API_CNV_054/request"
service_key = "1a4b11dc-37f3-40c5-81d7-5b297fb857f5"
num_of_rows = 100
total_pages = 150

# 결과 저장할 리스트 초기화
data = []

# API 요청 및 데이터 수집
for page_no in range(1, total_pages + 1):
    params = {
        "serviceKey": service_key,
        "numOfRows": num_of_rows,
        "pageNo": page_no
    }
    
    response = requests.get(base_url, params=params)
    
    # 응답 상태 확인
    if response.status_code == 200:
        try:
            # XML 파싱
            root = ET.fromstring(response.content)
            items = root.find(".//items")
            
            # 각 아이템에서 필요한 정보 추출 및 정리
            for idx, item in enumerate(items.findall("item")):
                no = (page_no - 1) * num_of_rows + idx + 1
                title = item.find("title").text if item.find("title") is not None else ""
                url = item.find("subDescription").text if item.find("subDescription") is not None else ""
                description = item.find("description").text if item.find("description") is not None else ""
                data.append({"NO": no, "단어": title, "URL": url, "설명": description})
            
            print(f"Page {page_no} processed successfully.")
        
        except ET.ParseError:
            print(f"Error parsing XML for page {page_no}.")
    
    else:
        print(f"Failed to retrieve data for page {page_no}. Status code: {response.status_code}")
    
    # API 요청이 많아 지연 시간 추가 (0.1초 정도)
    time.sleep(0.1)

# DataFrame으로 변환 후 파일로 저장
df = pd.DataFrame(data)
output_path = os.path.join(os.getcwd(), "word_data_with_description.csv")
df.to_csv(output_path, index=False, encoding="utf-8-sig")
print(f"Data collection complete. Saved to {output_path}")

