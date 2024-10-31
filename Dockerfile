FROM python:3.9.5

EXPOSE 8000

# 작업 디렉토리 설정
WORKDIR /test

# requirements.txt 파일에 지정된 모든 패키지를 설치
COPY ./test/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 전체 소스 코드 복사
COPY ./test /test

# FastAPI 애플리케이션 실행
CMD ["uvicorn", "test:app", "--host", "0.0.0.0", "--port", "8000"]