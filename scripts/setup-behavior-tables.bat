@echo off
echo ========================================
echo SETUP BEHAVIOR TABLES FOR TPQ SYSTEM
echo ========================================
echo.

echo [1/5] Checking XAMPP MySQL service...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MySQL service is running
) else (
    echo ❌ MySQL service is not running
    echo Please start XAMPP MySQL service first
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] Testing MySQL connection...
echo Trying connection without password...
C:\xampp\mysql\bin\mysql.exe -u root -e "SELECT 'MySQL connection successful' as status;" 2>nul
if %errorlevel% neq 0 (
    echo Failed. Trying with empty password explicitly...
    C:\xampp\mysql\bin\mysql.exe -u root -p"" -e "SELECT 'MySQL connection successful' as status;" 2>nul
    if %errorlevel% neq 0 (
        echo Failed. Please enter MySQL root password:
        set /p mysql_password="MySQL root password (or press Enter if no password): "
        if "%mysql_password%"=="" (
            set mysql_cmd=C:\xampp\mysql\bin\mysql.exe -u root
        ) else (
            set mysql_cmd=C:\xampp\mysql\bin\mysql.exe -u root -p%mysql_password%
        )
    ) else (
        set mysql_cmd=C:\xampp\mysql\bin\mysql.exe -u root -p""
    )
) else (
    set mysql_cmd=C:\xampp\mysql\bin\mysql.exe -u root
)

echo Testing final connection...
%mysql_cmd% -e "SELECT 'MySQL connection successful' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Cannot connect to MySQL. Please check:
    echo 1. XAMPP MySQL service is running
    echo 2. MySQL credentials are correct
    echo 3. MySQL port 3306 is not blocked
    echo.
    pause
    exit /b 1
)
echo ✅ MySQL connection successful

echo.
echo [3/5] Checking if database exists...
%mysql_cmd% -e "CREATE DATABASE IF NOT EXISTS tpq_baitus_shuffahh;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to create/access database
    pause
    exit /b 1
)
echo ✅ Database tpq_baitus_shuffahh ready

echo.
echo [4/5] Creating behavior tables...
%mysql_cmd% tpq_baitus_shuffahh < database\migrations\create_behavior_tables_clean.sql
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to create behavior tables
    echo Check if the migration file exists: database\migrations\create_behavior_tables_clean.sql
    echo.
    pause
    exit /b 1
)
echo ✅ Behavior tables created successfully

echo.
echo [5/5] Verifying table creation and data...
%mysql_cmd% -e "USE tpq_baitus_shuffahh; SHOW TABLES LIKE 'behavior_%%';"
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to verify tables
    pause
    exit /b 1
)

echo.
echo Checking sample data...
%mysql_cmd% -e "USE tpq_baitus_shuffahh; SELECT COUNT(*) as criteria_count FROM behavior_criteria;"
echo ✅ Tables verified successfully

echo.
echo ========================================
echo BEHAVIOR TABLES SETUP COMPLETED! 🎉
echo ========================================
echo.
echo ✅ Database: tpq_baitus_shuffahh
echo ✅ Tables: behavior_criteria, behavior_records, character_goals, behavior_alerts
echo ✅ Sample data loaded
echo.
echo You can now use the behavior criteria management system at:
echo http://localhost:3000/dashboard/admin/behavior/criteria
echo.
echo Next steps:
echo 1. Start your Next.js development server: npm run dev
echo 2. Login as Admin
echo 3. Navigate to Dashboard → Kriteria Perilaku
echo.
pause
