@echo off
REM PM2 Start Script for RoryK Application (Windows)
REM This script starts all services using PM2

setlocal enabledelayedexpansion

REM Environment (default to production)
set ENV=%1
if "%ENV%"=="" set ENV=production

echo [%date% %time%] Starting RoryK application in %ENV% mode...

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PM2 is not installed. Please install PM2 first: npm install -g pm2
    exit /b 1
)

REM Create logs directory
if not exist logs mkdir logs

REM Start services based on environment
if "%ENV%"=="production" (
    echo [%date% %time%] Starting all services for production...
    
    REM Build frontend first
    echo [%date% %time%] Building frontend...
    npm run build
    
    REM Start all services
    pm2 start ecosystem.config.js --env production
    
) else if "%ENV%"=="development" (
    echo [%date% %time%] Starting services for development...
    
    REM Start only backend for development (MongoDB Atlas is used)
    pm2 start ecosystem.config.js --only roryk-backend --env development
    
    REM Start frontend in development mode separately
    echo [%date% %time%] Starting frontend in development mode...
    start /b npm start
    
) else (
    echo [ERROR] Invalid environment: %ENV%. Use 'production' or 'development'
    exit /b 1
)

REM Save PM2 configuration
pm2 save

REM Show status
timeout /t 3 /nobreak >nul
pm2 status

echo [SUCCESS] RoryK application started successfully!

if "%ENV%"=="production" (
    echo Application URLs:
    echo   Frontend: http://localhost:3000
    echo   Backend: http://localhost:3001
    echo   Database: MongoDB Atlas ^(Cloud^)
) else (
    echo Development URLs:
    echo   Frontend: http://localhost:3000 ^(React dev server^)
    echo   Backend: http://localhost:3001
    echo   Database: MongoDB Atlas ^(Cloud^)
)

echo.
echo Useful PM2 commands:
echo   pm2 status          - Show process status
echo   pm2 logs            - Show logs
echo   pm2 monit           - Monitor processes
echo   pm2 restart all     - Restart all processes
echo   pm2 stop all        - Stop all processes

pause