# 응답 데이터 형식 : json
import json

# Gunicorn이 HTTP 요청 받을 때마다 호출하는 표준 WSGI 진입점
def application(environ, start_response):
    # 사용자 요청 url
    path = environ.get("PATH_INFO", "/")

    # 응답 데이터 생성
    body = json.dumps({"status": "ok", "path": path}).encode("utf-8")
    headers = [
        ("Content-Type", "application/json"),
        ("Content-Length", str(len(body))),
    ]
    start_response("200 OK", headers)
    return [body]