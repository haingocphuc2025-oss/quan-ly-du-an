@echo off
cd /d "%~dp0"
echo =======================================
echo  QLDA - v27 Localhost Server
echo =======================================
echo.
echo Starting HTTP server on http://127.0.0.1:8766
echo Starting File Helper on http://127.0.0.1:8780
echo.
start "QLDA HTTP Server" /MIN python -m http.server 8766
start "QLDA File Helper" /MIN python local_file_helper.py
echo.
echo Open: http://127.0.0.1:8766/giao-dien-desktop-don-gian_v27_quan.html
echo.
pause
