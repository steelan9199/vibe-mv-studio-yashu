@echo off
chcp 65001 >nul
title MV 工作室 · 8791
cd /d "%~dp0"

if not exist "node_modules" (
  echo 第一次启动：正在装依赖…
  call npm install
)

if not exist "web\dist\index.html" (
  echo 正在构建前端…
  call npm run build
)

start "" /b cmd /c "timeout /t 2 >nul & start http://127.0.0.1:8791/"
node server\main.mjs

echo.
echo 服务已停止。按任意键关闭。
pause >nul
