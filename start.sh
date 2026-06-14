#!/bin/bash
# Starts MongoDB (Windows service), backend, and frontend dev servers.
# Run this from the project root.

set -e

mkdir -p logs

# ── MongoDB ────────────────────────────────────────────────────────────────────
# Start the MongoDB Windows service if it exists and isn't running yet.
if command -v powershell.exe >/dev/null 2>&1; then
  STATUS=$(powershell.exe -NoProfile -Command \
    "(Get-Service -Name MongoDB -ErrorAction SilentlyContinue).Status" 2>/dev/null | tr -d '\r')
  if [ "$STATUS" = "Running" ]; then
    echo "MongoDB already running."
  elif [ "$STATUS" = "Stopped" ]; then
    echo "Starting MongoDB service..."
    powershell.exe -NoProfile -Command "Start-Service -Name MongoDB" 2>/dev/null \
      && echo "MongoDB started." \
      || echo "[!] Could not start MongoDB service — check that it is installed."
  else
    echo "[!] MongoDB service not found. Install it or set MONGODB_URI to a remote Atlas URI."
  fi
fi

# ── .env ───────────────────────────────────────────────────────────────────────
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "[!] Created backend/.env — fill in your API keys before scanning."
  echo ""
fi

# Warn about keys that affect core functionality
check_env() {
  local key=$1 hint=$2
  if ! grep -q "^${key}=.\+" backend/.env 2>/dev/null; then
    echo "  [!] ${key} not set — ${hint}"
  fi
}
check_env MONGODB_URI      "scans won't persist (using default localhost)"
check_env GITHUB_TOKEN     "GitHub API limited to 60 req/hr — repo scans may fail"
check_env ANTHROPIC_API_KEY "AI code analysis will be skipped"

# ── Dependencies ───────────────────────────────────────────────────────────────
if [ ! -d backend/node_modules ]; then
  echo "Installing backend dependencies..."
  (cd backend && npm install)
fi

if [ ! -d frontend/node_modules ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi

# ── Servers ────────────────────────────────────────────────────────────────────
echo "Starting backend..."
(cd backend && npm run dev) > logs/backend.log 2>&1 &
echo $! > .backend.pid

echo "Starting frontend..."
(cd frontend && npm run dev) > logs/frontend.log 2>&1 &
echo $! > .frontend.pid

# Wait for backend to be ready (up to 10s)
echo "Waiting for backend..."
for i in $(seq 1 10); do
  sleep 1
  if curl -sf http://localhost:3001/health >/dev/null 2>&1; then
    break
  fi
  if [ $i -eq 10 ]; then
    echo "[!] Backend didn't start in time. Check logs/backend.log"
  fi
done

echo ""
echo "  Backend  -> http://localhost:3001"
echo "  Frontend -> http://localhost:5173"
echo ""
echo "  Logs:  logs/backend.log  |  logs/frontend.log"
echo "  Stop:  ./end.sh"
echo ""
