@echo off
title Veritas AI Sentinel - Web Platform Launcher
cd /d "%~dp0\web"

echo ========================================================
echo       VERITAS AI SENTINEL - WEB PLATFORM LAUNCHER
echo ========================================================
echo.
echo Launching local web server on port 3000...
echo Serving: %~dp0web
echo.

start "" http://localhost:3000

python -m http.server 3000

pause
