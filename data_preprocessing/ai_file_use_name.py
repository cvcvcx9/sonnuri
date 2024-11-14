import pandas as pd

# CSV 파일 불러오기 (인코딩 설정 추가)
ai_file_df = pd.read_csv('ai_file_num.csv', encoding='cp949')  # 또는 encoding='euc-kr'
file_list_df = pd.read_csv('file_list.csv', encoding='cp949')  # 또는 encoding='euc-kr'

# 파일 번호를 기준으로 두 데이터프레임을 병합
merged_df = pd.merge(ai_file_df, file_list_df, left_on='number', right_on='file_num', how='left')

# 필요한 컬럼 선택 (ai_file_num의 'number'와 file_list의 'name'을 가져옵니다)
result_df = merged_df[['number', 'file_name']]

# 결과 출력
print(result_df)

# 결과를 CSV로 저장하고 싶다면 다음 코드를 사용하세요.
result_df.to_csv('ai_file_used_names.csv', index=False, encoding='cp949')
