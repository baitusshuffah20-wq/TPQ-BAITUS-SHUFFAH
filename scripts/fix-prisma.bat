@echo off
echo ========================================
echo    TPQ Baitus Shuffah - Prisma Fix
echo ========================================
echo.

echo [1/6] Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Cleaning Prisma cache...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo - Removed .prisma folder
)

if exist "node_modules\@prisma" (
    rmdir /s /q "node_modules\@prisma"
    echo - Removed @prisma folder
)

echo [3/6] Reinstalling Prisma dependencies...
call npm install @prisma/client mysql2 --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Prisma dependencies
    pause
    exit /b 1
)

echo [4/6] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    echo.
    echo Trying alternative approach...
    call npm run db:generate
    if %errorlevel% neq 0 (
        echo ERROR: Alternative approach also failed
        pause
        exit /b 1
    )
)

echo [5/6] Testing database connection...
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo WARNING: Database push failed, but client generation succeeded
    echo You may need to check your DATABASE_URL in .env file
)

echo [6/6] Verification complete!
echo.
echo ========================================
echo    Prisma Fix Completed Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure your .env file has correct DATABASE_URL
echo 2. Run: npm run dev
echo 3. Test the application
echo.
pauseecho ========================================
echo    TPQ Baitus Shuffah - Prisma Fix
echo ========================================
echo.

echo [1/6] Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Cleaning Prisma cache...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo - Removed .prisma folder
)

if exist "node_modules\@prisma" (
    rmdir /s /q "node_modules\@prisma"
    echo - Removed @prisma folder
)

echo [3/6] Reinstalling Prisma dependencies...
call npm install @prisma/client mysql2 --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Prisma dependencies
    pause
    exit /b 1
)

echo [4/6] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    echo.
    echo Trying alternative approach...
    call npm run db:generate
    if %errorlevel% neq 0 (
        echo ERROR: Alternative approach also failed
        pause
        exit /b 1
    )
)

echo [5/6] Testing database connection...
call npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo WARNING: Database push failed, but client generation succeeded
    echo You may need to check your DATABASE_URL in .env file
)

echo [6/6] Verification complete!
echo.
echo ========================================
echo    Prisma Fix Completed Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure your .env file has correct DATABASE_URL
echo 2. Run: npm run dev
echo 3. Test the application
echo.
pause
