@echo off
echo ========================================
echo FAIXA ROSA - Iniciando Servidor
echo ========================================
echo.

REM Matar processos Node anteriores
echo [1/3] Parando processos anteriores...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

REM Navegar para a pasta do projeto
cd /d "%~dp0"

REM Iniciar servidor de desenvolvimento
echo [2/3] Iniciando servidor de desenvolvimento...
echo.
echo ========================================
echo AGUARDE! O servidor esta iniciando...
echo Quando aparecer "Local: http://localhost:5173"
echo Abra seu navegador nesse endereco
echo ========================================
echo.

REM Iniciar npm dev
npm run dev

pause
