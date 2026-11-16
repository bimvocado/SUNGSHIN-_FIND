from django.shortcuts import render

from django.db import connection
from django.db.utils import OperationalError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
def health_check(request):
    try:
        # DB 커넥션을 열고 간단한 쿼리로 실제 연결 확인
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_status = "connected"
        http_status = status.HTTP_200_OK
    except OperationalError:
        db_status = "disconnected"
        http_status = status.HTTP_503_SERVICE_UNAVAILABLE

    return Response(
        {
            "status": "ok" if http_status == 200 else "error",
            "database": db_status,
        },
        status=http_status,
    )