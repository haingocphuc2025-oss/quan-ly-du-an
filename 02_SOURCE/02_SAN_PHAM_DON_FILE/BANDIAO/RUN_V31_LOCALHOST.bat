@echo off
setlocal

set "PORT=8766"
set "HELPER_PORT=8780"
set "HTML=giao-dien-desktop-don-gian_v31_quan.html"
set "APPDIR=%~dp0"
set "URL=http://127.0.0.1:%PORT%/%HTML%?build=20260717-v31"

if not exist "%APPDIR%%HTML%" (
  echo Khong tim thay %HTML%.
  pause
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay Python trong PATH.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=%PORT%; $helperPort=%HELPER_PORT%; $here='%APPDIR%'; if(-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)){Start-Process -WindowStyle Hidden -FilePath python -ArgumentList @('-m','http.server',[string]$port,'--bind','127.0.0.1') -WorkingDirectory $here}; if(-not (Get-NetTCPConnection -LocalPort $helperPort -State Listen -ErrorAction SilentlyContinue)){Start-Process -WindowStyle Hidden -FilePath python -ArgumentList @('local_file_helper.py') -WorkingDirectory $here}; Start-Sleep -Milliseconds 700; Start-Process '%URL%'"

echo Da mo: %URL%
timeout /t 2 >nul
endlocal
