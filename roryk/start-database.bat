@echo off
echo Starting RoryK Self-Hosted MongoDB Database...
echo.

echo Checking if Docker is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop and make sure it's running
    pause
    exit /b 1
)

echo Docker is available!
echo.

echo Starting MongoDB and Mongo Express containers...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ERROR: Failed to start database containers
    pause
    exit /b 1
)

echo.
echo ✅ Database started successfully!
echo.
echo 📊 MongoDB: mongodb://localhost:27017/roryk
echo 🌐 Mongo Express Web UI: http://localhost:8081
echo    Username: admin
echo    Password: roryk-web-admin
echo.
echo 🔐 Database Credentials:
echo    App User: roryk_app
echo    App Password: roryk-app-password-2024
echo.
echo ⚡ Next steps:
echo    1. Start the backend server: cd backend && npm start
echo    2. Start the frontend: cd .. && npm start
echo.
echo Press any key to continue...
pause >nul