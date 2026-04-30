@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "FRONTEND_URL=http://localhost:5173"

echo ==========================================
echo Starting Marky (backend + frontend + tunnel)
echo ==========================================
echo.

where cloudflared >nul 2>&1
if errorlevel 1 (
  echo [ERROR] cloudflared is not installed or not in PATH.
  echo Install it first, then run this file again.
  echo Winget command: winget install --id Cloudflare.cloudflared
  echo.
  pause
  exit /b 1
)

if not exist "%BACKEND_DIR%\package.json" (
  echo [ERROR] backend folder not found at: %BACKEND_DIR%
  pause
  exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
  echo [ERROR] frontend folder not found at: %FRONTEND_DIR%
  pause
  exit /b 1
)

echo Launching backend server...
start "Marky Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && npm run dev"

echo Launching frontend dev server...
start "Marky Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm run dev -- --host 0.0.0.0 --port 5173"

echo Waiting for servers to start...
timeout /t 8 /nobreak >nul

echo Launching Cloudflared Quick Tunnel...
echo Public URL will appear in the new tunnel window.
start "Marky Cloudflared Tunnel" cmd /k "cloudflared tunnel --url %FRONTEND_URL%"

echo.
echo All services started in separate windows.
echo Keep those windows open while using the app.
echo.
pause
