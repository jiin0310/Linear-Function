@echo off
chcp 65001 > nul
title Linear Function Master Launcher

echo ========================================================
echo   Linear Function Master App Starting...
echo ========================================================
echo.

echo [1/3] Clearing port 9876...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9876 2^>nul') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9877 2^>nul') do taskkill /f /pid %%a >nul 2>&1

echo [2/3] Opening browser at http://localhost:9876...
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:9876"

echo [3/3] Launching dev server...
echo.
echo ========================================================
echo   Web App URL: http://localhost:9876
echo ========================================================
echo.

npm run dev

pause
