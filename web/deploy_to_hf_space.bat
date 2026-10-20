@echo off
setlocal
title Deploy Veritas AI Sentinel Website to Hugging Face Spaces
cd /d "%~dp0"

echo =======================================================
echo   DEPLOY WEBSITE TO HUGGING FACE SPACES (STATIC SDK)
echo =======================================================
echo.
echo 1. Go to: https://huggingface.co/new-space
echo 2. Enter Space Name: e.g. deepfake-detector-web
echo 3. Select Space SDK: Static (HTML / CSS / JS) - 100%% Free
echo 4. Visibility: Public
echo 5. Click "Create Space"
echo.
echo =======================================================
echo.

set /p SPACE_URL="Paste your new Space Git URL (e.g. https://huggingface.co/spaces/rishi-9858/deepfake-detector-web): "

if "%SPACE_URL%"=="" (
    echo [ERROR] Space URL cannot be empty!
    pause
    exit /b 1
)

if not exist ".git" (
    echo Initializing Git repository...
    git init
    git checkout -b main
)

git remote remove origin 2>nul
git remote add origin %SPACE_URL%

echo Staging web files (HTML, CSS, JS, Samples)...
git add index.html styles.css app.js samples/ README.md .gitignore
git commit -m "Deploy Veritas AI Sentinel Web Platform"

echo.
echo Pushing to Hugging Face Spaces...
echo (When prompted for Username/Password, enter your HF username and HF Access Token with WRITE permissions)
echo.

git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo   SUCCESS! Website is deploying to Hugging Face Spaces!
    echo   Check your Space URL in 30 seconds.
    echo =======================================================
) else (
    echo.
    echo [ERROR] Push failed. Please check your Space URL and HF Access Token.
)

pause
