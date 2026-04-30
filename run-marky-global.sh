#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
FRONTEND_URL="http://localhost:5173"

echo "=========================================="
echo "Starting Marky (backend + frontend + tunnel)"
echo "=========================================="
echo

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "[ERROR] cloudflared is not installed or not in PATH."
  echo "Install it first, then run this script again."
  echo
  echo "macOS (Homebrew): brew install cloudflared"
  echo "Linux: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/package.json" ]; then
  echo "[ERROR] backend folder not found at: $BACKEND_DIR"
  exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "[ERROR] frontend folder not found at: $FRONTEND_DIR"
  exit 1
fi

cleanup() {
  echo
  echo "Stopping backend, frontend, and tunnel..."
  kill "$BACKEND_PID" "$FRONTEND_PID" "$TUNNEL_PID" 2>/dev/null || true
}

echo "Launching backend server..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!

echo "Launching frontend dev server..."
(cd "$FRONTEND_DIR" && npm run dev -- --host 0.0.0.0 --port 5173) &
FRONTEND_PID=$!

echo "Waiting for servers to start..."
sleep 8

echo "Launching Cloudflared Quick Tunnel..."
echo "Public URL will appear below."
(cloudflared tunnel --url "$FRONTEND_URL") &
TUNNEL_PID=$!

trap cleanup INT TERM EXIT

echo
echo "All services are running."
echo "Press Ctrl+C to stop everything."
echo

wait "$BACKEND_PID" "$FRONTEND_PID" "$TUNNEL_PID"
