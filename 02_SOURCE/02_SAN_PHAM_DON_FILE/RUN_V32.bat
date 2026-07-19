@echo off
setlocal

set "APP_DIR=%~dp0BANDIAO"
set "APP_FILE=giao-dien-desktop-don-gian_v32_quan.html"
set "APP_URL=http://127.0.0.1:8767/%APP_FILE%?build=20260719-v32"

if not exist "%APP_DIR%\%APP_FILE%" (
  echo Khong tim thay file V32:
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
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=8767; $helperPort=8780; $here='%APP_DIR%'; if(-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)){Start-Process -WindowStyle Hidden -FilePath python -ArgumentList @('-m','http.server',[string]$port,'--bind','127.0.0.1') -WorkingDirectory $here}; if(-not (Get-NetTCPConnection -LocalPort $helperPort -State Listen -ErrorAction SilentlyContinue)){Start-Process -WindowStyle Hidden -FilePath python -ArgumentList @('local_file_helper.py') -WorkingDirectory $here}; Start-Sleep -Milliseconds 700; Start-Process '%APP_URL%'"

echo Da mo QLDA V32:
echo %APP_URL%
timeout /t 2 >nul
endlocal
