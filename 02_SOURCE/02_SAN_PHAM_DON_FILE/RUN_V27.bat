@echo off
setlocal

set "APP_DIR=%~dp0BANDIAO"
set "APP_FILE=giao-dien-desktop-don-gian_v27_quan.html"
set "APP_URL=http://127.0.0.1:8766/%APP_FILE%?build=20260716-fix1"

if not exist "%APP_DIR%\%APP_FILE%" (
  echo Khong tim thay file V27:
  echo %APP_DIR%\%APP_FILE%
  pause
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  echo May chua co Python hoac Python chua nam trong PATH.
  pause
  exit /b 1
)

cd /d "%APP_DIR%"
start "QLDA V27 Web Server" /MIN python -m http.server 8766 --bind 127.0.0.1
start "QLDA V27 File Helper" /MIN python local_file_helper.py

timeout /t 2 /nobreak >nul
start "" "%APP_URL%"

echo QLDA V27 dang chay tai:
echo %APP_URL%
echo.
echo Co the dong cua so nay. Hai server van tiep tuc chay nen trong nen.
timeout /t 3 /nobreak >nul
endlocal
