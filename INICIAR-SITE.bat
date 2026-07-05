@echo off
title FAIXA ROSA - Servidor
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ============================================
echo   FAIXA ROSA - Iniciando Servidor
echo ============================================
echo.

REM Matar processos anteriores
echo [1/2] Parando processos anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/2] Iniciando servidor...
echo.
echo AGUARDE! O site vai abrir automaticamente.
echo.

REM Iniciar servidor em uma nova janela minimizada
start /MIN cmd /c "npm run dev"

REM Aguardar servidor iniciar
timeout /t 10 /nobreak >nul

REM Abrir navegador
start http://localhost:5173

echo ============================================
echo   SITE ABERTO!
echo ============================================
echo.
echo Pressione Ctrl+F5 no navegador para limpar cache
echo.
echo Para parar o servidor, feche este terminal
echo ============================================
pause
