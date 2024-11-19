import requests
import pandas as pd
import time

# 네이버 API 인증 정보 (입력 필요)
client_id = "YOUR_NAVER_CLIENT_ID"
client_secret = "YOUR_NAVER_CLIENT_SECRET"

# 데이터 불러오기
file_path = 'C:/Users/SSAFY/Desktop/자율/S11P31A301/morpheme/normalized_word_data_with_description.csv'

data = pd.read_csv(file_path)

# 새로운 컬럼 추가 (비어 있는 경우에만 뜻 채우기)
def get_definition(word):
    url = "https://openapi.naver.com/v1/search/encyc.json"
    headers = {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret
    }
    params = {
        "query": word
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        result = response.json()
        if "items" in result and len(result["items"]) > 0:
            return result["items"][0]["description"]
    return "뜻을 찾을 수 없습니다"

# 각 단어에 대해 뜻 가져오기
for index, row in data.iterrows():
    if pd.isna(row['설명']):  # 설명이 없는 경우만 검색
        data.at[index, '설명'] = get_definition(row['단어'])
        print(f"진행 중: {index + 1}/{len(data)} - 단어: {row['단어']} - 뜻: {data.at[index, '설명']}")
        time.sleep(0.5)  # API 요청 간에 잠시 멈춤 (필요에 따라 조정)

# 업데이트된 데이터 저장
output_file_path = '/mnt/data/normalized_word_data_with_description_updated.xlsx'
data.to_excel(output_file_path, index=False)
print("업데이트된 파일이 저장되었습니다.")
