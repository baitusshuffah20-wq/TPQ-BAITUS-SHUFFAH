@echo off
echo ========================================
echo BEHAVIOR CRITERIA SYSTEM - FULL TEST
echo ========================================
echo.

echo This script will:
echo 1. Install required dependencies
echo 2. Setup database tables
echo 3. Test database connection
echo 4. Test API endpoints
echo 5. Provide next steps
echo.
set /p continue="Continue? (y/n): "
if /i not "%continue%"=="y" (
    echo Test cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================
echo STEP 1: Installing Dependencies
echo ========================================
call scripts\install-test-dependencies.bat
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo STEP 2: Setting up Database
echo ========================================
call scripts\setup-behavior-tables.bat
if %errorlevel% neq 0 (
    echo ❌ Failed to setup database
    pause
    exit /b 1
)

echo.
echo ========================================
echo STEP 3: Testing Database Connection
echo ========================================
node scripts\test-database-connection.js
if %errorlevel% neq 0 (
    echo ❌ Database connection test failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo STEP 4: Testing API Endpoints
echo ========================================
echo Starting Next.js server for API testing...
echo Please make sure your Next.js server is running on http://localhost:3000
echo.
set /p server_ready="Is your Next.js server running? (y/n): "
if /i not "%server_ready%"=="y" (
    echo Please start your server with: npm run dev
    echo Then run: node scripts\test-behavior-api.js
    pause
    exit /b 0
)

node scripts\test-behavior-api.js
if %errorlevel% neq 0 (
    echo ❌ API test failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo ALL TESTS COMPLETED! 🎉
echo ========================================
echo.
echo ✅ Dependencies installed
echo ✅ Database setup complete
echo ✅ Database connection working
echo ✅ API endpoints tested
echo.
echo 🚀 NEXT STEPS:
echo 1. Open your browser: http://localhost:3000
echo 2. Login as Admin
echo 3. Navigate to: Dashboard → Kriteria Perilaku
echo 4. Test the interface:
echo    - Add new criteria
echo    - Edit existing criteria
echo    - View criteria details
echo    - Use search and filters
echo.
echo 📚 Documentation: docs\BEHAVIOR_CRITERIA_MANAGEMENT.md
echo.
pause
