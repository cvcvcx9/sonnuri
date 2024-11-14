import pandas as pd

# 파일 읽기 (encoding='euc-kr' 또는 'cp949' 시도)
file_list_df = pd.read_csv('file_list.csv', encoding='euc-kr')
morphemes_df = pd.read_csv('BankPage_morphemes.csv', encoding='euc-kr')

# 결과를 저장할 리스트 생성
morpheme_matches = []

# 형태소와 파일명을 비교하여 정확히 일치하는 경우에만 결과에 추가
for _, row in morphemes_df.iterrows():
    morpheme = row['형태소']  # 형태소 열 이름이 '형태소'라고 가정
    matching_entry = file_list_df[file_list_df['file_name'] == morpheme]  # 형태소와 파일명이 정확히 일치하는지 확인
    
    # 일치하는 경우 정보 추가
    if not matching_entry.empty:
        file_num = matching_entry.iloc[0]['file_num']
        file_name = matching_entry.iloc[0]['file_name']
    else:
        file_num = None
        file_name = None
    
    # 형태소와 일치하는 파일 정보를 추가한 결과 리스트 생성
    morpheme_matches.append({
        '형태소': morpheme,
        'file_name': file_name,
        'file_num': file_num
    })

# 결과를 데이터프레임으로 생성
morpheme_matches_df = pd.DataFrame(morpheme_matches)

# 결과 출력
print(morpheme_matches_df)

# 결과를 CSV 파일로 저장 (선택사항)
morpheme_matches_df.to_csv('morpheme_matches.csv', index=False, encoding='euc-kr')
