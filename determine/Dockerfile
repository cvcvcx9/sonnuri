FROM python:3.12

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt와 main.py 복사
COPY . /app

RUN pip install -r requirements.txt

# FastAPI 애플리케이션 실행
EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]