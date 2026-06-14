#!/bin/bash
# Stops both dev servers that were started with ./start.sh

stop_pid() {
  local file=$1
  if [ ! -f "$file" ]; then return; fi

  local pid
  pid=$(cat "$file")
  rm -f "$file"

  if [ -z "$pid" ]; then return; fi

  if command -v taskkill >/dev/null 2>&1; then
    taskkill /F /T /PID "$pid" >/dev/null 2>&1 \
      && echo "Stopped PID $pid" \
      || echo "PID $pid was already gone"
  else
    kill -TERM "$pid" 2>/dev/null \
      && echo "Stopped PID $pid" \
      || echo "PID $pid was already gone"
  fi
}

# Kill any stray node processes that grabbed port 3001 or 5173
kill_port() {
  local port=$1
  if command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "
      \$p = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
      if (\$p) { Stop-Process -Id \$p.OwningProcess -Force -ErrorAction SilentlyContinue }
    " 2>/dev/null
  fi
}

stop_pid .backend.pid
stop_pid .frontend.pid

kill_port 3001
kill_port 5173

echo "Done."
