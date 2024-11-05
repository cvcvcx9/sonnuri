from fastapi import FastAPI, HTTPException
from kiwipiepy import Kiwi
from pydantic import BaseModel
from typing import List, Dict
import pymongo

kiwi = Kiwi(load_default_dict=True, integrate_allomorph=True, model_type='sbg', typos=None)
app = FastAPI()

# MongoDB 클라이언트 설정 (예: 로컬호스트)
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["sonnuri"]
collection = db["sonnuri"]

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

class InputData(BaseModel):
    data: str
    
class Word(BaseModel):
    text: str
    url: str
    tokens: List[Token]
    
class OutputData(BaseModel):
    words: List[Word]

@app.get("/")
async def determine_texts(input_data: InputData):
    try:
        # kiwi를 활용해 들어온 값을 토큰들로 이루어진 문장으로 형태소 분석
        analyzed_result = kiwi.split_into_sents(input_data, return_tokens=True)
        
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
        lenCnt = sentence.tokens[0].start
        wordCnt = 0
        for token in sentence.tokens:
            newForm = token.form
            newUrl = ''
            # 띄어쓰기를 만났을 때: 단어를 만들고 token 리스트를 비움
            if lenCnt < token.start:
                word = Word(text=texts[wordCnt], tokens=word_tokens, url='')
                wordCnt += 1
                words.append(word)
                word_tokens = []
            # 태그가 'E'로 시작할 경우 form의 맨 앞에 '-' 추가 (어미이기 때문)
            if token.tag.startswith('E'):
                newForm = '-' + token.form
            
            url_entry = collection.find_one({"tag": token.form})
            if url_entry:
                newUrl = url_entry[0]
                
            lenCnt = token.start + token.len

            # 새 Token 객체 생성
            new_token = Token(
                form=newForm,
                tag=token.tag,
                start=token.start,
                len=token.len,
                url=newUrl
            )
            word_tokens.append(new_token)
        # 마지막 토큰을 추가한 후 words에 word를 추가해준다
        word = Word(text=texts[wordCnt], tokens=word_tokens, url='')
        words.append(word)
        
        result.append({"sentence": sentence.text, "words": words})
    
    return result

test = kiwi.split_into_sents("저는 영리합니다. 찬 바람이 나의 뺨을 쳤습니다. 나는 천재다. 세게 때리자", return_tokens=True)
a = extract_words_from_sentence(test)
print(a)