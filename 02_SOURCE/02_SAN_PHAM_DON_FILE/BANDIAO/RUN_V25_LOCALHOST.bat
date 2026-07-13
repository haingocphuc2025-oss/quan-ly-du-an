@echo off
setlocal

set "PORT=8766"
set "HTML=giao-dien-desktop-don-gian_v25_quan.html"
set "APPDIR=%~dp0"
set "URL=http://127.0.0.1:%PORT%/%HTML%"

where python >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay Python. Hay cai Python hoac mo file HTML bang cach cu.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=%PORT%; $helperPort=8780; $here='%APPDIR%'; $listening=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if(-not $listening){ Start-Process -WindowStyle Hidden -FilePath python -ArgumentList @('-m','http.server',[string]$port,'--bind','127.0.0.1') -WorkingDirectory $here; Start-Sleep -Milliseconds 500 }; $helper=Get-NetTCPConnection -LocalPort $helperPort -State Listen -ErrorAction SilentlyContinue; if(-not $helper){ Start-Process -WindowStyle Hidden -FilePath python -ArgumentList @('local_file_helper.py') -WorkingDirectory $here; Start-Sleep -Milliseconds 500 }; Start-Process '%URL%'"

echo Da mo: %URL%
echo Neu trang chua hien, doi 2-3 giay roi bam refresh.
timeout /t 2 >nul
