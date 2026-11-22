@echo off
TITLE AIBIDS - AI-Powered BI & Decision Support System
COLOR 0B

echo ==============================================================================
echo        AIBIDS: AI-Powered BI & Decision Support System
echo ==============================================================================
echo.
echo  [1/3] Initializing Backend Server (FastAPI + In-Memory DuckDB OLAP)...
start "AIBIDS-Backend" /min cmd /c "cd /d "%~dp0" && backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload"

echo  [2/3] Initializing Frontend Application (React + Vite)...
start "AIBIDS-Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo  [3/3] Launching Web Browser at http://localhost:5173...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ==============================================================================
echo  AIBIDS IS NOW LIVE AND READY!
echo.
echo  * Frontend UI:     http://localhost:5173
echo  * Backend API:     http://localhost:8000
echo  * API Docs:        http://localhost:8000/docs
echo.
echo  To stop the application anytime, double-click STOP_AIBIDS.bat
echo ==============================================================================
echo.
echo  You can minimize this window.
pause
