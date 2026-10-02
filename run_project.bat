@echo off
title Upay MilestoneAI Runner
echo ========================================================
echo Starting upay MilestoneAI + SanchayBot Stack...
echo ========================================================

:: Open Backend in a new window
start "FastAPI Backend" cmd /k "cd /d e:\Upay-Hackathon\milestone-ai && python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

:: Open Frontend in a new window
start "Next.js Frontend" cmd /k "cd /d e:\Upay-Hackathon\milestone-ai\frontend && npm run dev"

echo.
echo Servers started successfully!
echo Backend:  http://127.0.0.1:8000/docs
echo Frontend: http://localhost:3000
echo.
pause
