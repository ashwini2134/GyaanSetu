@echo off
echo Starting Fraylon LMS Backend and Frontend...

start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"

echo Development servers are starting in separate windows.
echo Please do not close those windows.
