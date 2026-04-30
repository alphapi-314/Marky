#!/usr/bin/env bash
set -euo pipefail

FRONTEND_URL="http://localhost:5173"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "[ERROR] cloudflared is not installed or not in PATH."
  echo "Install it first:"
  echo "  macOS: brew install cloudflared"
  echo "  Linux: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  exit 1
fi

echo "Starting Cloudflared tunnel for $FRONTEND_URL"
echo "Copy the https://*.trycloudflare.com URL and share it."
echo "Press Ctrl+C to stop the tunnel."
echo

cloudflared tunnel --url "$FRONTEND_URL"
