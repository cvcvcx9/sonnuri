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
import boto3

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

question_mark_url = collection.find_one({"Word": "-ㅂ니까"}).get("URL")
question_mark_description = collection.find_one({"Word": "-ㅂ니까"}).get("Description", "물음표")

# S3 설정
S3_BUCKET = os.getenv('AWS_S3_BUCKET')
S3_REGION = os.getenv('AWS_REGION')
s3_client = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=S3_REGION
)

class TextInput(BaseModel):
    text: str
    type: str

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

class SynonymUrl(BaseModel):
    url: str
    confidence: float

@app.post("/determine")
async def determine_texts(input_data: TextInput):
    try:
        # 생성된 문장과 일치하는게 있는지 확인
        pre_created_url = find_pre_created_sentence_url(input_data.text.strip())
        if (pre_created_url):
            return {"sentences": {"sentence": input_data.text, "words": [Word(form = input_data.text, url= pre_created_url, definition='', tokens=[])]}, "urls": pre_created_url}
        
        # ChatGPT를 활용해 문장을 한국어 -> 한국수어 문법으로 변형
        ksl_sentence = translate_sentence(input_data.text)
        # kiwi를 활용해 들어온 값을 토큰들로 이루어진 문장으로 형태소 분석
        analyzed_result = kiwi.split_into_sents(ksl_sentence, return_tokens=True)
        
        extracted_result, video_urls = await extract_words_from_sentence(analyzed_result, input_data.type)
        
        # result = await make_one_video(extracted_result)
        
        return {"sentences": extracted_result, "urls": video_urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing string: {str(e)}")
    

# 토큰들로 이루어진 문장을 후처리: 띄어쓰기 단위로 단어를 구성하는 형태소들의 수어 영상을 붙여서 텍스트로 반환한다.
async def extract_words_from_sentence(sentences: List[Sentence], type: str) -> List[Dict[str, List[Word]]]:
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
                await saveWord(texts[wordCnt], word_tokens, words, sentence.text, type)
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
            
            tokenUrl, definition = get_url_and_definition(newForm, sentence.text, type)
                
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
        
        await saveWord(texts[wordCnt], word_tokens, words, sentence.text, type)
        result.append({"sentence": sentence.text, "words": words})
        
    # url이 없는 단어 - url이 없는 토큰을 자음/모음 단위로 나누어 url 가져오기    
    video_urls = []
    for r in result:
        for word in r["words"]:
            if word.form.endswith('?'):
                word.tokens.append(Token(form="?", tag="SF", start=0, len=1, url=question_mark_url, definition=question_mark_description))
            if word.url:
                video_urls.extend(word.url.split(","))
                if word.form.endswith('?'):
                    word.url += ',' + question_mark_url
                    video_urls.append(question_mark_url)
                if word.definition == '':
                    word.definition = get_definition_in_sentence(word.form, r.sentence)
                continue
            for token in word.tokens:
                if token.url:
                    video_urls.extend(token.url.split(","))
                    if definition == '':
                        token.definition = get_definition_in_sentence(token.form, r.sentence)
                if not token.url and type != 'finance':
                    definition = get_definition_in_sentence(token.form, r.sentence)
                    # response = await get_synonym_url(token.form, definition)
                    # if not response:
                    url = ''
                    texts = split_korean_chars(token.form)
                    for text in texts:
                        text_url = ''
                        data = collection.find_one({"Word": text})
                        if data:
                            text_url = data.get("URL", '')
                            url += ',' + text_url
                    if url:
                        url = url[1:]
                        video_urls.extend(url.split(","))
                    token.url = url
                    token.definition = definition
                    # if response:
                    #     new_data = {
                    #         "No": collection.find_one(sort=[("No", -1)])["No"] + 1,
                    #         "Word": token.form,
                    #         "URL": response,
                    #         "Description": definition
                    #     }
                    #     token.url = response
                    #     token.definition = definition
                    #     video_urls.extend(token.url.split(","))
                    #     collection.insert_one(new_data)
    
    return result, video_urls

async def saveWord(word: str, word_tokens: List[Token], words: List[Word], sentence: str, type: str):
    text = remove_non_alphanumeric_korean(word)
    url, definition = get_url_and_definition(text, sentence, type)
    word = Word(form=word, tokens=word_tokens, url=url, definition=definition)
    words.append(word)
    
def get_url_and_definition(word: str, sentence: str, type: str):
    url = ''
    definition = ''
    c = collection
    if (type == 'finance'):
        c = db["finance_word"]
    data = c.find_one({"Word": word})
    if data:
        url = data.get("URL")
        definition = data.get("Description", '')
        if definition == '':
            definition = get_definition_in_sentence(word, sentence)
            c.update_one({'_id': data.get("_id")}, {'$set': {'Description': definition}})
    return url, definition
    
# def get_url_and_definition(word: str, sentence: str, type: str):
#     url = ''
#     definition = ''
    
#     if (type == 'finance'):
#         finance_collection = db["finance_word"]
#         data = finance_collection.find_one({"Word": word})
#         if data:
#             url = data.get("URL")
#             definition = data.get("Description", '')
#             if definition == '':
#                 definition = get_definition_in_sentence(word, sentence)
#                 finance_collection.update_one({'_id': data.get("_id")}, {'$set': {'Description': definition}})
#         if not data:
#             texts = split_korean_chars(word)
#             for word in texts:
#                  text_url = ''
#                  data = finance_collection.find_one({"Word": word})
#                  if data:
#                     text_url = data.get("URL", '')
#                  url += ',' + text_url
#             url = url[1:]
#         return url, definition
    
#     data = collection.find_one({"Word": word})
#     if data:
#         url = data.get("URL")
#         definition = data.get("Description", '')
#         if definition == '':
#             definition = get_definition_in_sentence(word, sentence)
#             collection.update_one({'_id': data.get("_id")}, {'$set': {'Description': definition}})
#     if not data:
#         definition = get_definition_in_sentence(word, sentence)
#         response = get_synonym_url(word, definition)
#         if not response or not response.matched_url:
#             url = ''
#             texts = split_korean_chars(word)
#             for word in texts:
#                  text_url = ''
#                  data = collection.find_one({"Word": word})
#                  if data:
#                     text_url = data.get("URL", '')
#                  url += ',' + text_url
#             url = url[1:]
#         if response.matched_url:
#             new_data = {
#                 "No": collection.find_one(sort=[("No", -1)])["No"] + 1,
#                 "Word": word,
#                 "URL": url,
#                 "Description": definition
#             }
#             collection.insert_one(new_data)
#             url = response.matched_url
        
#     return url, definition
    
    
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
                   "그 외의 다른 말은 붙이지 마."
                   "다른 언어가 있을 경우 한국어로 번역해서 보여줘."
                   },
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

def get_definition_in_sentence(text: str, sentence: str):
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": "너는 문장에서 단어가 가지는 뜻을 보여주는 사전이야. "
                   "단어의 사전적 정의만 제공해줘. 추가적인 설명이나 예시는 포함하지 마."
                   "형식은 다음과 같이 제공해줘. 단어:뜻"
                   },
                  {"role": "user", "content": f"단어:{text}, 문장:{sentence}"}]
    )
    return response.choices[0].message.content.split(":")[1].strip()

# morpheme 서버로 요청 보내서 유사어 url과 confidence 가져오기
async def get_synonym_url(word: str, definition: str):
    target_url = "http://k11a301.p.ssafy.io:8005/find_similar_word"
    async with httpx.AsyncClient(timeout=180) as client:
        try:
            response = await client.post(
                target_url,
                json={
                    "definition": definition,
                    "word": word
                }
            )
            response.raise_for_status()
            matched_url = response.json().get("matched_url", "")  # 키가 없을 경우 기본값 ""
            return matched_url
        except Exception as e:
            print(f"Error getting synonymUrl: {str(e)}")
            return False

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
        
def find_pre_created_sentence_url(sentence: str):
    sentence_collection = db["sign_sentence"]
    url = ''
    pre_created_sentence = sentence_collection.find_one({"Sentence": sentence})
    if pre_created_sentence:
        url = pre_created_sentence.get("URL", '')
    
    return url

def get_s3_file_list(bucket, prefix):
    """S3 폴더 내 파일 리스트 가져오기"""
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)
    if 'Contents' not in response:
        return []
    return [obj['Key'] for obj in response['Contents'] if obj['Key'] != prefix]

def parse_file_name(file_name):
    """파일 이름에서 No와 Word 추출"""
    match = re.match(r'(\d+)_(.+)\.mp4$', file_name)
    if match:
        no = int(match.group(1))
        word = match.group(2)
        return no, word
    return None, None

@app.get("/import-s3-ai-words")
async def import_s3_ai_words():
    finance_collection = db['finance_word']
    file_list = get_s3_file_list(S3_BUCKET, "AI_Videos/")

    # MongoDB에 데이터 삽입
    for file_key in file_list:
        # 파일 이름 파싱
        file_name = file_key.split('/')[-1]  # 폴더 경로 제거
        no, word = parse_file_name(file_name)

        if no is not None and word is not None:
            # S3 URL 생성
            s3_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{file_name}"
            
            # 기존 MongoDB 값
            document = collection.find_one({'No': no})
            description = ''
            if document:
                description = document.get("Description", '')

            # MongoDB에 삽입할 데이터
            query = {"No": no, "Word": word}  # 조건: No와 Word가 같은 데이터
            finance_document = {
                "$set": {
                    'No': no,
                    'Word': word,
                    'URL': s3_url,
                    'Description': description
                }
            }

            # MongoDB에 데이터 삽입
            finance_collection.update_one(query, finance_document, upsert=True)
            print(f"Inserted into MongoDB: {finance_document}")
        else:
            print(f"Skipping file (invalid format): {file_name}")