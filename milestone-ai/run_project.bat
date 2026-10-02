@echo off
title Upay MilestoneAI Runner
echo ========================================================
echo Starting upay MilestoneAI + SanchayBot Stack...
echo ========================================================

cd /d "%~dp0"

:: Start Backend in a separate window
start "FastAPI Backend" cmd /k "python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

:: Start Frontend in a separate window
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Servers started successfully!
echo - Web Dashboard:    http://localhost:3000
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
