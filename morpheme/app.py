import os
import numpy as np
import pandas as pd
import pymongo
import torch
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
from kobert_transformers import get_kobert_model, get_tokenizer

# FastAPI 앱 생성
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# .env 파일 로드
load_dotenv()

# 환경 변수에서 MongoDB 사용자 이름과 비밀번호 불러오기
mongo_username = os.getenv("MONGO_USERNAME")
mongo_password = os.getenv("MONGO_PASSWORD")

# MongoDB 클라이언트 설정
mongo = pymongo.MongoClient(f"mongodb://{mongo_username}:{mongo_password}@k11a301.p.ssafy.io:8017/?authSource=admin")
db = mongo["sonnuri"]
collection = db["sign_word"]

# MongoDB에서 데이터 불러오기
documents = collection.find()
word_data = pd.DataFrame(list(documents))

# "단어"와 "설명" 열을 문자열로 변환한 후 결합하여 컨텍스트 문자열 생성
word_data['context'] = word_data['Word'].astype(str) + ": " + word_data['Description'].astype(str)


# KoBERT 모델 및 토크나이저 로드
tokenizer = get_tokenizer()
model = get_kobert_model()

# 임베딩 파일 경로
embeddings_file = "kobert_embeddings.npy"

# 임베딩 생성 함수
def generate_embeddings(text_list):
    embeddings = []
    for text in text_list:
        inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = model(**inputs)
            cls_embedding = outputs.last_hidden_state[:, 0, :].numpy()
            embeddings.append(cls_embedding[0])
    return np.array(embeddings)

# 임베딩이 이미 저장된 경우 불러오기, 그렇지 않으면 생성 후 저장
if os.path.exists(embeddings_file):
    embeddings = np.load(embeddings_file)
    print("임베딩이 성공적으로 불러와졌습니다!")
else:
    embeddings = generate_embeddings(word_data['context'].tolist())
    np.save(embeddings_file, embeddings)
    print("임베딩이 성공적으로 생성되고 저장되었습니다!")


# 데이터 모델 정의
class WordDefinition(BaseModel):
    word: str
    definition: str

# 유사한 단어와 URL을 찾는 함수
def get_similar_word_url(definition):
    # 정의를 임베딩 벡터로 변환
    inputs = tokenizer(definition, return_tensors='pt', truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
        query_embedding = outputs.last_hidden_state[:, 0, :].numpy()

    # 코사인 유사도 계산
    similarities = cosine_similarity(query_embedding, embeddings)
    
    # 가장 유사한 단어의 인덱스를 찾기
    most_similar_index = similarities.argmax()
    similarity_score = round(similarities.max(), 2)
    
    
    # 유사도 점수와 매칭된 결과 반환
    matched_word = word_data.iloc[most_similar_index]['context']
    matched_url = word_data.iloc[most_similar_index]['URL']
    matched_description = word_data.iloc[most_similar_index]['Description']
    
    return similarity_score, matched_word, matched_url, matched_description

# 단어와 정의를 받아서 유사한 단어와 URL을 반환하는 엔드포인트
@app.post("/find_similar_word")
async def find_similar_word(word_def: WordDefinition):
    similarity_score, matched_word, matched_url, matched_description = get_similar_word_url(word_def.definition)
    
    if similarity_score < 0.7:
        return {
           "matched_url":""
        }
    
    return {
        "matched_url": matched_url
    }

