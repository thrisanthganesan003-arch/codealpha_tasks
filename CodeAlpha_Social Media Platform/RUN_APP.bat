@echo off
echo ====================================
echo Social Media App - Setup & Run
echo ====================================
echo.

echo Killing any old Node processes...
taskkill /F /IM node.exe 2>nul

timeout /t 2 /nobreak

echo.
echo ====================================
echo Step 1: Starting BACKEND
echo ====================================
echo Opening backend terminal...
cd /d "C:\Users\Thrisanth\Downloads\social thri\backend"
start "Backend - npm run dev" cmd /k "npm run dev"

timeout /t 3 /nobreak

echo.
echo ====================================
echo Step 2: Opening App in Browser
echo ====================================
echo.
echo Backend should be running on: http://localhost:5000
echo.
echo Now open the frontend using LIVE SERVER in VS Code:
echo.
echo 1. In VS Code: Right-click frontend/index.html
echo 2. Click: "Open with Live Server"
echo.
echo OR use this command in another terminal:
echo    cd C:\Users\Thrisanth\Downloads\social thri\frontend
echo    npx serve -l 3000 .
echo.
echo Then open: http://localhost:3000
echo.
echo ====================================
echo SETUP COMPLETE!
echo ====================================
echo.
pause
