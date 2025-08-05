@echo off
REM PM2 Stop Script for RoryK Application (Windows)
REM This script stops all PM2 services

echo [%date% %time%] Stopping RoryK application...

REM Stop all PM2 processes
pm2 stop all 2>nul

REM Show final status
pm2 status

echo [SUCCESS] All services stopped successfully!

echo.
echo To completely remove all processes, run:
echo   pm2 delete all
echo.
echo To start services again, run:
echo   pm2-start.bat [production^|development]

pause