import pandas as pd

# 기존 CSV 파일 불러오기
df = pd.read_csv("word_data.csv", encoding="utf-8-sig")

# 단어 컬럼을 정규화하는 과정
# '단어' 컬럼에서 여러 단어로 구성된 경우, 쉼표를 기준으로 분리
normalized_data = []
for _, row in df.iterrows():
    words = row['단어'].split(',')
    for word in words:
        normalized_data.append({"단어": word.strip(), "URL": row['URL']})

# 정규화된 데이터로 새로운 DataFrame 생성
normalized_df = pd.DataFrame(normalized_data)

# NO 컬럼을 새로 할당 (1부터 시작하여 순차적으로 증가)
normalized_df.insert(0, 'NO', range(1, len(normalized_df) + 1))

# 정규화된 데이터 CSV로 저장
normalized_df.to_csv("normalized_word_data.csv", index=False, encoding="utf-8-sig")
print("1st Normalization complete with reassigned NO. Saved to normalized_word_data.csv")