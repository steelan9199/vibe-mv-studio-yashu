@echo off
setlocal
cd /d "%~dp0"
title MV 工作室 - 127.0.0.1:8791

rem ---- 优先用指定的 Node v24.22.1，找不到再退回 PATH 上的 node ----
set "NPM=npm"
if exist "D:\software\nvm\v24.22.1\npm.cmd" set "NPM=D:\software\nvm\v24.22.1\npm.cmd"
set "NODE=node"
if exist "D:\software\nvm\v24.22.1\node.exe" set "NODE=D:\software\nvm\v24.22.1\node.exe"

echo.
echo   ============================================
echo     MV 工作室   Hono + Vue 3
echo     http://127.0.0.1:8791
echo   ============================================
echo.

if exist "node_modules\vite\package.json" goto build
echo   [1/3] 第一次启动，正在安装依赖（只装这一次，慢一点正常）...
call %NPM% install --no-audit --no-fund
if errorlevel 1 goto fail

:build
echo   [2/3] 正在构建前端页面...
call %NPM% run build
if errorlevel 1 goto fail

echo   [3/3] 正在启动服务，就绪后自动用 Edge 打开工作台...
echo.
chcp 65001 >nul
set "MV_OPEN_BROWSER=1"
"%NODE%" server\main.mjs
set "RC=%errorlevel%"
set "MV_OPEN_BROWSER="
chcp 936 >nul
echo.
if "%RC%"=="2" goto :eof
if not "%RC%"=="0" goto fail
echo   按任意键关闭窗口。
pause >nul
goto :eof

:fail
echo.
echo   启动失败，原因看上面几行报错。
echo   别急着关窗口，截图发给 AI 就能定位。
echo.
pause >nul
goto :eof
