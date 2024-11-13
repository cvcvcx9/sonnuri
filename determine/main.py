from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from kiwipiepy import Kiwi
from pydantic import BaseModel
from typing import List, Dict
from dotenv import load_dotenv
from openai import OpenAI
import re
import os
import pymongo
import unicodedata
import httpx
import asyncio

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
collection = db["sign_word"]

class TextInput(BaseModel):
    text: str

class Token(BaseModel):
    form: str
    tag: str
    start: int
    len: int
    url: str
    definition: str

class Sentence(BaseModel):
    text: str
    start: int
    end: int
    tokens: List[Token]
    
class Word(BaseModel):
    form: str
    url: str
    definition: str
    tokens: List[Token]
    
class OutputData(BaseModel):
    words: List[Word]
    
class VideoRequest(BaseModel):
    video_urls: List[str]

@app.post("/determine")
async def determine_texts(input_data: TextInput):
    try:
        # ChatGPT를 활용해 문장을 한국어 -> 한국수어 문법으로 변형
        ksl_sentence = translate_sentence(input_data.text)
        # kiwi를 활용해 들어온 값을 토큰들로 이루어진 문장으로 형태소 분석
        analyzed_result = kiwi.split_into_sents(ksl_sentence, return_tokens=True)
        
        extracted_result, video_urls = extract_words_from_sentence(analyzed_result)
        
        # result = await make_one_video(extracted_result)
        
        return {"sentences": extracted_result, "urls": video_urls}
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
            # 띄어쓰기를 만났을 때: 단어를 만들고 token 리스트를 비움
            if lenCnt < token.start:
                saveWord(texts, wordCnt, word_tokens, words)
                wordCnt += 1
                word_tokens = []
                
            lenCnt = token.start + token.len
            
            # 특수문자, 한자 등 없는 단어, 부사격 조사를 제외한 조사, 접미사 제외(영어=SN는 포함)
            if token.tag[0] == 'E' or token.tag[0] == 'S' and (token.tag != 'SL' or token.tag != 'SN') or token.tag[0] == 'X' and token.tag != 'XPN' or token.tag[0] == 'J' and token.tag != 'JKB':
                continue
            # 태그가 'E'로 시작할 경우 form의 맨 앞에 '-' 추가 (어미이기 때문)
            # if token.tag[0] == 'E':
            #     # if token.form[0] == '다':
            #     #     continue
            #     # 종성 자음이 있을 경우 초성 자음으로 변경(검색을 위함)
            #     if (ord('ᆨ') <= ord(token.form[0]) <= ord('ᇂ')):
            #         newForm = final_to_initial.get(token.form[0]) + token.form[1:]
            #     if token.form != 'ㅂ니다' or token.form != '었':
            #         continue                    
            #     newForm = '-' + newForm

            # 태그가 'V'로 시작할 경우 form의 맨 뒤에 '다' 추가 (용언이기 때문)
            if token.tag[0] == 'V':
                newForm = token.form + '다'
            
            tokenUrl = ''
            definition = ''
            data = collection.find_one({"Word": remove_non_alphanumeric_korean(newForm)})
            if data:
                tokenUrl = data.get("URL")
                definition = data.get("Description", "")
            # else:
                # newUrl = find_similar_word_url(newForm)
                
            # 새 Token 객체 생성
            new_token = Token(
                form=newForm.replace("?", ""),
                tag=token.tag,
                start=token.start,
                len=token.len,
                url=tokenUrl,
                definition=definition
            )
            word_tokens.append(new_token)
        
        saveWord(texts, wordCnt, word_tokens, words)
        result.append({"sentence": sentence.text, "words": words})
        
    # url이 없는 단어 - url이 없는 토큰을 자음/모음 단위로 나누어 url 가져오기    
    video_urls = []
    question_mark_url = collection.find_one({"Word": "-ㅂ니까"}).get("URL")
    question_mark_description = collection.find_one({"Word": "-ㅂ니까"}).get("Description", "물음표")
    for r in result:
        for word in r["words"]:
            if word.form.endswith('?'):
                word.tokens.append(Token(form="?", tag="SF", start=0, len=1, url=question_mark_url, definition=question_mark_description))
            if word.url != '':
                video_urls.extend(word.url.split(","))
                if word.form.endswith('?'):
                    word.url += ',' + question_mark_url
                    video_urls.append(question_mark_url)
                continue
            for token in word.tokens:
                if token.url != '':
                    video_urls.extend(token.url.split(","))
                    continue
                token_url = ''
                texts = split_korean_chars(token.form)
                for text in texts:
                    text_url = ''
                    data = collection.find_one({"Word": text})
                    if data:
                        text_url = data["URL"]
                    token_url += ',' + text_url
                token.url = token_url[1:]
                video_urls.extend(token.url.split(","))
    
    return result, video_urls

def saveWord(texts: List[str], wordCnt: int, word_tokens: List[Token], words: List[Word]):
    text = remove_non_alphanumeric_korean(texts[wordCnt])
    data = collection.find_one({"Word": text})
    wordUrl = ''
    definition = ''
    if data:
        wordUrl = data.get("URL")
        definition = data.get("Description", "")
    word = Word(form=texts[wordCnt], tokens=word_tokens, url=wordUrl, definition=definition)
    words.append(word)
    
# 영어 (A-Z, a-z), 숫자 (0-9), 한글 (\uAC00-\uD7A3 완성형, \u3131-\u3163 자음/모음) 만 남기고 나머지 제거
def remove_non_alphanumeric_korean(text):
    return re.sub(r'[^A-Za-z0-9\uAC00-\uD7A3\u3131-\u3163]', '', text)

# ChatGPT 호출(문장 -> 한국수어)
def translate_sentence(prompt: str):
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": "너는 한국어를 한국수어 문법으로 바꿔주는 번역기야."
                   "제시된 한국어 문장들을 한국수어 문법 형식으로 번역해서 응답해줘."
                   "최대한 단어의 원형을 유지해줘."
                   "제시된 한국어 문장에서 값을 새로 추가해서는 안돼."
                   "다른 언어가 있을 경우 한국어로 번역해서 보여줘."
                   },
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# 유니코드 자모 리스트
CHOSEONG = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]
JUNGSEONG = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
    'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
]
JONGSEONG = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 
    'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]

def split_korean_chars(text):
    result = []
    korean_re = re.compile('[가-힣]')  # 한글 글자 필터링

    for char in text:
        if korean_re.match(char):  # 한글일 경우
            code = ord(char) - 0xAC00  # 유니코드 계산
            choseong = CHOSEONG[code // 588]  # 초성 추출
            jungseong = JUNGSEONG[(code % 588) // 28]  # 중성 추출
            jongseong = JONGSEONG[code % 28]  # 종성 추출

            result.append(choseong)  # 초성 추가
            result.append(jungseong)  # 중성 추가
            if jongseong:  # 종성이 있을 경우
                result.append(jongseong)
        else:
            result.append(char)  # 한글이 아닌 문자는 그대로 추가
    return result

def make_one_video(extracted_words: List[Dict[str, List[Word]]]):
    video_urls = []
    # url이 없는 단어 - url이 없는 토큰을 자음/모음 단위로 나누어 url 가져오기
    for e in extracted_words:
        for word in e["words"]:
            if word.url != '':
                video_urls.extend(word.url.split(","))
                continue
            for token in word.tokens:
                if token.url != '':
                    video_urls.extend(token.url.split(","))
                    continue
                token_url = ''
                texts = split_korean_chars(token.form)
                for text in texts:
                    text_url = ''
                    url_entry = collection.find_one({"Word": text})
                    if url_entry:
                        text_url = url_entry["URL"]
                    token_url += ',' + text_url
                token.url = token_url[1:]
                video_urls.extend(token.url.split(","))
    
    # 하나의 영상으로 만들어서 보내기
    return process_videos(video_urls)    

async def process_videos(video_urls: List[str]):
    target_url = "http://k11a301.p.ssafy.io:8003/process_videos"
    async with httpx.AsyncClient(timeout=180) as client:
        try:
            response = await client.post(
                target_url,
                json={
                    "video_urls": video_urls
                }
            )
            response.raise_for_status()
            return response.json()  # 대상 서버의 응답 반환
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing videos: {str(e)}")