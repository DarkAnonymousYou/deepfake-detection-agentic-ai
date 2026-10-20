@echo off
setlocal
title Deploy Veritas AI Sentinel Website to GitHub Pages
cd /d "%~dp0\.."

echo =======================================================
echo   DEPLOY VERITAS AI SENTINEL WEBSITE TO GITHUB PAGES
echo =======================================================
echo.
echo Checking repository status and staging clean website files...
echo.

git add .gitignore README.md start_website.bat web/ docs/
git commit -m "Deploy Veritas AI Sentinel Web Platform and Docs"

echo.
echo Pushing clean files to GitHub (origin main)...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo   SUCCESS! Files pushed to GitHub repository!
    echo =======================================================
    echo.
    echo Next step to activate free GitHub Pages hosting:
    echo 1. Open your repository on GitHub:
    echo    https://github.com/DarkAnonymousYou/deepfake-detection-agentic-ai/settings/pages
    echo.
    echo 2. Under 'Build and deployment':
    echo    - Source: 'Deploy from a branch'
    echo    - Branch: 'main'
    echo    - Folder: select '/docs' (from the dropdown)
    echo.
    echo 3. Click 'Save'
    echo.
    echo Your website will be live in ~60 seconds at:
    echo https://DarkAnonymousYou.github.io/deepfake-detection-agentic-ai/
    echo =======================================================
) else (
    echo.
    echo [ERROR] Git push failed. Please check your GitHub credentials or internet connection.
)

pause
