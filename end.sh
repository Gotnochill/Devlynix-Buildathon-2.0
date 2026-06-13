#!/bin/bash
# Stops both dev servers that were started with ./start.sh

stop_pid() {
  local file=$1
  if [ ! -f "$file" ]; then return; fi

  local pid
  pid=$(cat "$file")
  rm -f "$file"

  if [ -z "$pid" ]; then return; fi

  # taskkill kills the whole process tree on Windows (Git Bash)
  # kill covers macOS / Linux
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

stop_pid .backend.pid
stop_pid .frontend.pid

echo "Done."
