#!/bin/bash
# Starts both the backend and frontend dev servers.
# Run this from the project root.

set -e

mkdir -p logs

# Copy .env if it doesn't exist yet
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "[!] Created backend/.env from .env.example"
  echo "    Add your GITHUB_TOKEN and NVD_API_KEY there for better results."
  echo ""
fi

# Install dependencies only if node_modules is missing
if [ ! -d backend/node_modules ]; then
  echo "Installing backend dependencies..."
  (cd backend && npm install)
fi

if [ ! -d frontend/node_modules ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo "Starting backend..."
(cd backend && npm run dev) > logs/backend.log 2>&1 &
echo $! > .backend.pid

echo "Starting frontend..."
(cd frontend && npm run dev) > logs/frontend.log 2>&1 &
echo $! > .frontend.pid

# Give servers a moment to bind
sleep 1

echo ""
echo "  Backend  -> http://localhost:3001"
echo "  Frontend -> http://localhost:5173"
echo ""
echo "  Logs:  logs/backend.log  |  logs/frontend.log"
echo "  Stop:  ./end.sh"
echo ""
