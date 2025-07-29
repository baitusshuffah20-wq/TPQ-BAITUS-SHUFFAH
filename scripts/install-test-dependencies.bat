@echo off
echo ========================================
echo INSTALLING TEST DEPENDENCIES
echo ========================================
echo.

echo [1/2] Installing mysql2 for database testing...
npm install mysql2
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to install mysql2
    pause
    exit /b 1
)
echo ✅ mysql2 installed successfully

echo.
echo [2/2] Installing node-fetch for API testing...
npm install node-fetch
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to install node-fetch
    pause
    exit /b 1
)
echo ✅ node-fetch installed successfully

echo.
echo ========================================
echo DEPENDENCIES INSTALLED! 🎉
echo ========================================
echo.
echo You can now run:
echo 1. node scripts\test-database-connection.js
echo 2. node scripts\test-behavior-api.js
echo.
pause
