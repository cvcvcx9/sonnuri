import pandas as pd

# 로컬 경로에 맞게 수정
economic_terms_file = 'c:/Users/SSAFY/Desktop/분석/economic_terms_with_sign_language_fixed.csv'
sign_language_data_file = 'c:/Users/SSAFY/Desktop/분석/normalized_word_data (1).csv'

# 파일을 불러오기
economic_terms_df = pd.read_csv(economic_terms_file)
sign_language_data_df = pd.read_csv(sign_language_data_file)

# URL을 생성하는 함수 정의
def get_urls(expression):
    words = expression.split('+')
    urls = []
    for word in words:
        matching_rows = sign_language_data_df[sign_language_data_df['Word'] == word.strip()]
        urls.extend(matching_rows['URL'].tolist())
    return ', '.join(urls)

# URL 열 생성
economic_terms_df['URL'] = economic_terms_df['수어표현'].apply(get_urls)

# 결과를 출력하거나 저장
print(economic_terms_df)

# 필요에 따라 파일로 저장
economic_terms_df.to_csv('c:/Users/SSAFY/Desktop/분석/updated_economic_terms_with_urls.csv', index=False)