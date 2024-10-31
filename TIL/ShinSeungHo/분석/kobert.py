from gensim.models import FastText
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# 단어 데이터 로드
with open("extracted_words.txt", "r", encoding="utf-8") as f:
    words = [line.strip() for line in f]

# FastText는 문장 단위로 학습하므로, 각 단어를 단독 문장으로 리스트에 구성
sentences = [[word] for word in words]

# FastText 모델 학습
model = FastText(sentences, vector_size=100, window=3, min_count=1, sg=1, epochs=10)

# 모델 저장
model.save("fasttext_korean.model")
print("FastText 모델이 'fasttext_korean.model'로 저장되었습니다.")

# 특정 키워드를 포함하는 단어 및 유사도 찾기
def find_similar_words_with_keyword(keyword, words, model, top_n=5):
    # 키워드가 포함된 단어 필터링
    matching_words = [word for word in words if keyword in word]
    
    if not matching_words:
        print(f"'{keyword}'와 관련된 단어가 없습니다.")
        return
    
    print(f"'{keyword}'와 관련된 단어들 및 유사도:")
    for word in matching_words:
        try:
            # 키워드와 해당 단어 간의 유사도 계산
            similarity = cosine_similarity(
                model.wv[keyword].reshape(1, -1),
                model.wv[word].reshape(1, -1)
            )[0][0]
            print(f"{word}: {similarity}")
        except KeyError:
            print(f"'{word}' 단어가 모델에 없습니다.")

# 예시: '운동' 키워드를 포함하는 단어와 유사도 찾기
find_similar_words_with_keyword("운동", words, model)
