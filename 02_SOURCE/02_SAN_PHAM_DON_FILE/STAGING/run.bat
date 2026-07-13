@echo off
cd /d "%~dp0"
echo Dang khoi dong server...
start "" python -m http.server 8000
timeout /t 2 /nobreak > nul
echo Mo Chrome...
start "" "chrome.exe" "http://localhost:8000/giao-dien-desktop-don-gian_v20_quan.html"
if errorlevel 1 (
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:8000/giao-dien-desktop-don-gian_v20_quan.html"
)
