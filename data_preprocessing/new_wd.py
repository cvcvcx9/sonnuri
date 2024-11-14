import pandas as pd

def parse_morphemes(data):
    result = {}
    
    # 각 형태소별로 파일 정보를 수집
    for morpheme, file_name, file_num in data:
        # file_name과 file_num이 있고, +나 /가 포함된 경우만 처리
        if pd.notna(file_name) and pd.notna(file_num) and ('+' in str(file_name) or '/' in str(file_name)):
            # + 또는 /로 분리
            components = str(file_name).replace(' ', '').replace('/', '+').split('+')
            numbers = str(file_num).replace(' ', '').replace('/', '+').split('+')
            
            # 형태소별로 파일 정보 리스트 생성
            if morpheme not in result:
                result[morpheme] = []
            
            # 각 구성요소에 대해 결과 생성
            for comp, num in zip(components, numbers):
                if comp and num:  # 빈 값이 아닌 경우만 처리
                    file_info = f"{num.strip()}_{comp.strip()}"
                    if file_info not in result[morpheme]:
                        result[morpheme].append(file_info)
    
    return result

# CSV 파일 읽기 (탭으로 구분된 파일로 가정)
try:
    # 탭으로 구분된 파일로 읽기 시도
    df = pd.read_csv('data_preprocessing/new_wd.csv', sep='\t', encoding='cp949')
except Exception as e:
    print(f"탭 구분자로 읽기 실패. 다른 구분자로 시도합니다: {e}")
    try:
        # 쉼표로 구분된 파일로 읽기 시도
        df = pd.read_csv('data_preprocessing/new_wd.csv', encoding='cp949')
    except Exception as e:
        print(f"CSV 파일 읽기 실패: {e}")
        raise

print("데이터 미리보기:")
print(df.head())
print("\n컬럼명:", df.columns.tolist())

# 필요한 열만 추출하여 데이터 처리
data = df[['형태소', 'file_name', 'file_num']].values

# 형태소 분석 실행
results = parse_morphemes(data)

# 결과 출력
for morpheme, file_info in results.items():
    print(f"형태소: {morpheme}, 파일: {file_info}")

# 결과를 새로운 DataFrame으로 변환하여 저장
output_data = [(k, str(v)) for k, v in results.items()]
output_df = pd.DataFrame(output_data, columns=['형태소', '파일'])
output_df.to_csv('parsed_morphemes.csv', index=False, encoding='cp949')