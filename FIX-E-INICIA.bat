@echo off
chcp 65001 >nul
echo ========================================
echo FAIXA ROSA - FIX COMPLETO E INICIAR
echo ========================================
echo.

REM Ir para a pasta do projeto
cd /d "%~dp0"

echo [1/5] Parando todos os processos Node...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/5] Limpando cache do npm...
call npm cache clean --force

echo [3/5] Removendo pastas problematicas do node_modules...
REM Remover apenas as pastas problematicas
rd /s /q "node_modules\@esbuild" 2>nul
rd /s /q "node_modules\@rollup" 2>nul
rd /s /q "node_modules\@swc" 2>nul
rd /s /q "node_modules\.vite" 2>nul
timeout /t 1 /nobreak >nul

echo [4/5] Reinstalando pacotes nativos do Windows...
call npm install @rollup/rollup-win32-x64-msvc --save-optional --force --legacy-peer-deps
call npm install @esbuild/win32-x64 --save-optional --force --legacy-peer-deps
call npm install @swc/core-win32-x64-msvc --save-optional --force --legacy-peer-deps

echo.
echo [5/5] Iniciando servidor de desenvolvimento...
echo.
echo ========================================
echo AGUARDE! Servidor iniciando...
echo Quando ver "Local: http://localhost:5173"
echo Abra o Chrome em: http://localhost:5173
echo E pressione CTRL+SHIFT+DELETE para limpar cache
echo ========================================
echo.

call npm run dev

pause
