@echo off
title Student Attendance System - Building Project
echo =========================================================================
echo   BUILDING FRONTEND (REACT) AND BACKEND (SPRING BOOT)
echo =========================================================================
echo.

echo [Step 1/3] Building React Frontend with Vite...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo [Step 2/3] Syncing frontend dist to Spring Boot static resources...
xcopy /E /I /Y "frontend\dist\*" "backend\src\main\resources\static\"

echo [Step 3/3] Packaging Spring Boot JAR with Maven...
cd backend
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERROR] Backend packaging failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo =========================================================================
echo   SUCCESS! Unified JAR created at backend\target\attendance-backend-1.0.0.jar
echo   You can run it with: run.bat
echo =========================================================================
pause
