@echo off
chcp 65001 >nul
title QLDA Graph Visualization - MODULES_V26
echo ==================================================
echo  KHOI DONG CODEBASE-MEMORY-MCP UI
echo  Project: MODULES_V26
echo  URL: http://localhost:9749
echo ==================================================
echo.
echo Dang khoi dong server...
start "" codebase-memory-mcp --ui=true --port=9749
echo.
echo Dang cho server khoi dong (3-5 giay)...
timeout /t 4 /nobreak >nul
echo.
echo Mo trinh duyet...
start "" http://localhost:9749
echo.
echo ==================================================
echo  DA SAN SANG!
echo  - Graph UI: http://localhost:9749
echo  - Project: MODULES_V26 (909 nodes, 2721 edges)
echo  - De dung: Tat cua so nay (server se chay ngam)
echo ==================================================
pause