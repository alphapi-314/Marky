@echo off
setlocal

set "FRONTEND_URL=http://localhost:5173"

where cloudflared >nul 2>&1
if errorlevel 1 (
  echo [ERROR] cloudflared is not installed or not in PATH.
  echo Install it first: winget install --id Cloudflare.cloudflared
  pause
  exit /b 1
)

echo Starting Cloudflared tunnel for %FRONTEND_URL%
echo Copy the https://*.trycloudflare.com URL and share it.
echo Press Ctrl+C to stop the tunnel.
echo.
cloudflared tunnel --url %FRONTEND_URL%
