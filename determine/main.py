from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kiwipiepy import Kiwi
from pydantic import BaseModel
from typing import List, Dict
from dotenv import load_dotenv
from openai import OpenAI
import os
import pymongo
# import asyncio

# .env 파일 로드
load_dotenv()

# 환경 변수에서 MongoDB 사용자 이름과 비밀번호 불러오기
mongo_username = os.getenv("MONGO_USERNAME")
mongo_password = os.getenv("MONGO_PASSWORD")

# OPENAI 연결 설정
openai = OpenAI(
    organization="org-CdqlMsWjfTiylVQPL4TCGTy0",
    api_key=os.getenv("OPENAI_API_KEY")
)

kiwi = Kiwi(load_default_dict=True, integrate_allomorph=True, model_type='sbg', typos=None)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB 클라이언트 설정 (예: 로컬호스트)
mongo = pymongo.MongoClient(f"mongodb://{mongo_username}:{mongo_password}@k11a301.p.ssafy.io:8017/?authSource=admin")
db = mongo["sonnuri"]
collection = db["sonnuri"]

class TextInput(BaseModel):
    text: str

class Token(BaseModel):
    form: str
    tag: str
    start: int
    len: int
    url: str

class Sentence(BaseModel):
    text: str
    start: int
    end: int
    tokens: List[Token]
    
class Word(BaseModel):
    form: str
    url: str
    tokens: List[Token]
    
class OutputData(BaseModel):
    words: List[Word]
    
# 종성 자음 -> 초성 자음 매핑 표
final_to_initial = {
    'ᆨ': 'ㄱ',
    'ᆩ': 'ㄲ',
    'ᆫ': 'ㄴ',
    'ᆮ': 'ㄷ',
    'ᆯ': 'ㄹ',
    'ᆷ': 'ㅁ',
    'ᆸ': 'ㅂ',
    'ᆺ': 'ㅅ',
    'ᆻ': 'ㅆ',
    'ᆼ': 'ㅇ',
    'ᆽ': 'ㅈ',
    'ᆾ': 'ㅊ',
    'ᆿ': 'ㅋ',
    'ᇀ': 'ㅌ',
    'ᇁ': 'ㅍ',
    'ᇂ': 'ㅎ'
}

@app.post("/determine")
async def determine_texts(input_data: TextInput):
    try:
        # ChatGPT를 활용해 문장을 한국어 -> 한국수어 문법으로 변형
        ksl_sentence = translate_sentence(input_data.text)
        # kiwi를 활용해 들어온 값을 토큰들로 이루어진 문장으로 형태소 분석
        analyzed_result = kiwi.split_into_sents(ksl_sentence, return_tokens=True)
        
        result = extract_words_from_sentence(analyzed_result)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing string: {str(e)}")
    

# 토큰들로 이루어진 문장을 후처리: 띄어쓰기 단위로 단어를 구성하는 형태소들의 수어 영상을 붙여서 텍스트로 반환한다.
def extract_words_from_sentence(sentences: List[Sentence]) -> List[Dict[str, List[Word]]]:
    result = []
    for sentence in sentences:
        texts = sentence.text.split(" ")
        words = []
        word_tokens = []
        if not sentence.tokens:
            continue
        lenCnt = sentence.tokens[0].start
        wordCnt = 0
        for token in sentence.tokens:
            newForm = token.form
            newUrl = ''
            # 띄어쓰기를 만났을 때: 단어를 만들고 token 리스트를 비움
            if lenCnt < token.start:
                saveWord(texts, wordCnt, word_tokens, words)
                wordCnt += 1
                word_tokens = []
                
            lenCnt = token.start + token.len
            
            # 특수문자, 한자 등 없는 단어, 부사격 조사를 제외한 조사, 접미사 제외(영어=SH는 포함)
            if token.tag[0] == 'S' and token.tag != 'SH' or token.tag[0] == 'X' and token.tag != 'XPN' or token.tag[0] == 'J' and token.tag != 'JKB':
                continue
            # 태그가 'E'로 시작할 경우 form의 맨 앞에 '-' 추가 (어미이기 때문)
            if token.tag[0] == 'E':
                if token.form[0] == '다':
                    continue
                # 종성 자음이 있을 경우 초성 자음으로 변경(검색을 위함)
                if (ord('ᆨ') <= ord(token.form[0]) <= ord('ᇂ')):
                    newForm = final_to_initial.get(token.form[0]) + token.form[1:]
                newForm = '-' + newForm
            # 태그가 'V'로 시작할 경우 form의 맨 뒤에 '다' 추가 (용언이기 때문)
            if token.tag[0] == 'V':
                newForm = token.form + '다'
            
            url_entry = collection.find_one({"Word": newForm.replace(" ", "")})
            if url_entry:
                newUrl = url_entry["URL"]
                
            # 새 Token 객체 생성
            new_token = Token(
                form=newForm,
                tag=token.tag,
                start=token.start,
                len=token.len,
                url=newUrl
            )
            word_tokens.append(new_token)
        
        saveWord(texts, wordCnt, word_tokens, words)
        result.append({"sentence": sentence.text, "words": words})
    
    return result
# test = asyncio.run(determine_texts("쎄한 느낌이 들어 쎄했다. 맨 앞의 그 사람은 힘이 세다. 먹어본 그 삼겹살은 정말 맛있었다. 저는 영리입니다. 찬 바람이 나의 뺨을 쳤습니다. 나는 천재다. 세게 때리자. 아시아인프라투자은행은 멋지다"))
# print(test)

def saveWord(texts: List[str], wordCnt: int, word_tokens: List[Token], words: List[Word]):
    text = filter_not_korean(texts[wordCnt])
    url_entry = collection.find_one({"Word": text})
    wordUrl = ''
    if url_entry:
        wordUrl = url_entry["URL"]
    word = Word(form=texts[wordCnt], tokens=word_tokens, url=wordUrl)
    words.append(word)

def filter_not_korean(text: str) -> str:
    t = ""
    for c in text:
        if '가' <= c <= '힣':
            t += c
    return t

# ChatGPT 호출
def translate_sentence(prompt: str):
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": "너는 한국어를 한국수어 문법으로 바꿔주는 번역기야. 제시된 한국어 문장/문장들을 한국수어 문법으로 번역해서 응답해줘."},
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
