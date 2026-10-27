@echo off
title Student Attendance Management System - Launching
echo =========================================================================
echo   STUDENT ATTENDANCE MANAGEMENT SYSTEM (DevOps Enabled)
echo =========================================================================
echo.
echo [1/3] Checking PostgreSQL service...
sc query postgresql-x64-18 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL service is not running. Attempting to start...
    net start postgresql-x64-18 >nul 2>&1
)

echo [2/3] Launching Spring Boot & React Unified Application...
echo       Host: http://localhost:8000 (or http://localhost:8080)
echo.

rem Open browser after 4 seconds
start "" timeout /t 4 /nobreak >nul & start http://localhost:8000/

java -jar backend\target\attendance-backend-1.0.0.jar

pause
