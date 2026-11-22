@echo off
TITLE Stop AIBIDS Application
COLOR 0C

echo ==============================================================================
echo        Stopping AIBIDS: AI-Powered BI & Decision Support System
echo ==============================================================================
echo.

echo Stopping FastAPI backend on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping React Vite frontend on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo All AIBIDS background server processes have been stopped successfully!
echo ==============================================================================
echo.
pause
