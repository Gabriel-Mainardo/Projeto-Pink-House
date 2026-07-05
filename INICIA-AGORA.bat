@echo off
cd /d "%~dp0"
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
start cmd /k "npm run dev"
timeout /t 8 /nobreak
start http://localhost:5173
echo Site abrindo no navegador em 8 segundos...
pause
