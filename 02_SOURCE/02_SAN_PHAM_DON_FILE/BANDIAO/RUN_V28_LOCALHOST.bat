@echo off
cd /d "%~dp0"
echo =======================================
echo  QLDA - v28 Localhost Server
echo =======================================
echo.
echo Starting HTTP server on http://127.0.0.1:8766
echo Starting File Helper on http://127.0.0.1:8780
echo.
start "QLDA HTTP Server" /MIN python -m http.server 8766 --bind 127.0.0.1
start "QLDA File Helper" /MIN python local_file_helper.py
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8766/giao-dien-desktop-don-gian_v28_quan.html?build=20260716-v28"
echo.
echo Open: http://127.0.0.1:8766/giao-dien-desktop-don-gian_v28_quan.html
echo.
pause

