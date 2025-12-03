@echo off
echo ========================================
echo FORCING DEV SERVER TO RELOAD APP.TSX
echo ========================================

cd /d F:\smartbiz

echo.
echo Step 1: Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Step 2: Clearing build caches...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist

echo.
echo Step 3: Touching App.tsx to update timestamp...
copy /b views\App.tsx +,, >nul

echo.
echo Step 4: Starting dev server...
echo.
start "Vite Dev Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Done! Wait for server to start, then:
echo 1. Close ALL browser windows
echo 2. Open NEW browser window
echo 3. Go to localhost:5173
echo 4. Open Console (F12)
echo 5. Look for RED error message
echo ========================================
pause
