@echo off
title Student Attendance System - Running Selenium QA Test Suite
echo =========================================================================
echo   RUNNING 10 AUTOMATED SELENIUM WEBDRIVER TEST CASES (SECTION 7)
echo =========================================================================
echo.
cd backend
mvn test -Dtest=SeleniumAttendanceTest
echo.
echo =========================================================================
echo   Tests completed. Review results above.
echo =========================================================================
pause
