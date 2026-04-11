#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

stop_port() {
  local port="$1"
  local pids=""

  # macOS/Linux: lsof is the most reliable cross-tool for "who listens on a port".
  pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "${pids}" ]]; then
    return 0
  fi

  echo "Освобождаю порт ${port} (PID: ${pids})"
  # Try graceful shutdown first.
  kill ${pids} 2>/dev/null || true

  # Wait up to ~5s for the port to be released.
  for _ in {1..25}; do
    sleep 0.2
    if ! lsof -ti tcp:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
  done

  # Force kill if still listening.
  pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    echo "Порт ${port} все еще занят, делаю kill -9 (PID: ${pids})"
    kill -9 ${pids} 2>/dev/null || true
  fi
}

stop_port 3000
stop_port 8000

echo "Запускаю web + api (Ctrl+C чтобы остановить)"
exec pnpm dev

