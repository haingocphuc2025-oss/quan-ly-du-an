@echo off
setlocal
set "TARGET=%~dp0..\BANDIAO\RUN_V26_LOCALHOST.bat"
if not exist "%TARGET%" (
  echo Khong tim thay file RUN trong BANDIAO.
  pause
  exit /b 1
)
call "%TARGET%"

