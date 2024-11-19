FROM python:3.12

# ffmpeg 및 관련 라이브러리 설치
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    libx264-dev \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt와 main.py 복사
COPY . /app

RUN pip install -r requirements.txt

# FastAPI 애플리케이션 실행
EXPOSE 8003
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8003"]