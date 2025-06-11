@echo off
echo Starting Task Manager Application...
echo.
echo Opening Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Opening Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Frontend will be available at: http://localhost:5173
echo Backend API available at: http://localhost:4000
echo.
pause 