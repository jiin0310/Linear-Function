@echo off
chcp 65001 > nul
title 일차함수 그래프 마스터 실행기

echo ========================================================
echo   🚀 일차함수 그래프 마스터 앱을 시작합니다...
echo ========================================================
echo.

echo [1/3] 기존 서버 포트(9876) 정리 중...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9876 2^>nul') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9877 2^>nul') do taskkill /f /pid %%a >nul 2>&1

echo [2/3] 웹 브라우저 자동 실행 준비 완료!
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:9876"

echo [3/3] 개발 서버 실행 (http://localhost:9876)...
echo.
echo ========================================================
echo   💡 브라우저가 잠시 후 자동으로 열립니다!
echo   종료하시려면 이 창을 닫으시면 됩니다.
echo ========================================================
echo.

npm run dev

pause
