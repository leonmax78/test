@echo off
setlocal EnableExtensions EnableDelayedExpansion
title GitHub Pages Publish Tool

echo ========================================
echo   GitHub Pages Publish Tool
echo ========================================
echo.

REM Put this BAT file in your website root folder.
REM The folder should contain index.html and your data files.

echo [1/5] Checking Git...
git --version
if errorlevel 1 (
    echo.
    echo ERROR: Git was not found.
    echo Please install Git for Windows first.
    echo Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo [2/5] Checking Git repository...
if not exist ".git" (
    echo.
    echo This folder is not a Git repository yet.
    echo.
    set /p REPO_URL=Paste your GitHub repository URL, for example https://github.com/USER/REPO.git : 
    if "!REPO_URL!"=="" (
        echo ERROR: Repository URL is empty.
        pause
        exit /b 1
    )

    echo.
    echo Initializing Git repository...
    git init
    git branch -M main
    git remote add origin "!REPO_URL!"
) else (
    echo OK: This is already a Git repository.
)

echo.
echo [3/5] Current remote:
git remote -v

echo.
echo [4/5] Adding files and creating commit...
git add .

set "COMMIT_MSG=Update website"
set /p USER_MSG=Commit message, press Enter to use "Update website" : 
if not "!USER_MSG!"=="" set "COMMIT_MSG=!USER_MSG!"

git commit -m "!COMMIT_MSG!"
if errorlevel 1 (
    echo.
    echo Notice: No new changes to commit, or commit failed.
    echo If there are no new changes, this is OK.
)

echo.
echo [5/5] Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ERROR: Push failed.
    echo.
    echo Common reasons:
    echo 1. You are not logged in to GitHub.
    echo 2. Repository URL is wrong.
    echo 3. You do not have permission.
    echo 4. Remote branch is not main.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo DONE: Uploaded to GitHub.
echo ========================================
echo.
echo GitHub Pages setup:
echo Settings - Pages - Deploy from a branch - main - root
echo.
pause
