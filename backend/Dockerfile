FROM python:3.12-slim

# 컨테이너 내부에서 불필요한 .pyc 바이트코드 생성 방지하는 환경변수
ENV PYTHONDONTWRITEBYTECODE=1
# 파이썬 출력 버퍼링 비활성화하는 환경변수
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# PostgreSQL 어댑터 빌드를 위한 필수 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# 이미지 빌드 시점에 먼저 Gunicorn 설치 -> 다운로드 캐시를 줄여서 이미지 용량 줄임
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]