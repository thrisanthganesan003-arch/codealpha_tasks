@echo off
REM Social Media App - Start Script

echo ============================================
echo Starting Social Media Platform
echo ============================================

REM Kill any existing Node processes on port 5000
echo Cleaning up port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /pid %%a /f 2>nul

timeout /t 2 /nobreak

REM Start Backend
echo.
echo ============================================
echo Starting BACKEND on port 5000...
echo ============================================
cd /d "C:\Users\Thrisanth\Downloads\social thri\backend"
start "Backend Server" cmd /k "npm run dev"

timeout /t 3 /nobreak

REM Start Frontend
echo.
echo ============================================
echo Starting FRONTEND on port 3000...
echo ============================================
cd /d "C:\Users\Thrisanth\Downloads\social thri\frontend"
start "Frontend Server" cmd /k "npx serve -l 3000 ."

timeout /t 3 /nobreak

echo.
echo ============================================
echo SERVERS STARTED!
echo ============================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Opening browser...
start http://localhost:3000

timeout /t 5 /nobreak
