@echo off
echo Iniciando servidor de desenvolvimento...
cd /d "%~dp0"
call npm run dev
pause
