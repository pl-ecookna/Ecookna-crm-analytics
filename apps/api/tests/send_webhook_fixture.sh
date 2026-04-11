#!/usr/bin/env bash
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

FIXTURE_PATH="${1:-}"
AUDIO_PATH="${2:-}"
WEBHOOK_URL="${WEBHOOK_URL:-http://localhost:3000/webhook/getcrmdata}"

if [[ -z "$FIXTURE_PATH" || -z "$AUDIO_PATH" ]]; then
  echo "Usage: WEBHOOK_URL=... $0 <fixture.json> <audio.mp3>" >&2
  exit 1
fi

curl -sS -X POST "$WEBHOOK_URL" \
  -F "data=@${AUDIO_PATH}" \
  -F "call_id=$(jq -r '.call_id // empty' "$FIXTURE_PATH")" \
  -F "call_datetime=$(jq -r '.call_datetime // empty' "$FIXTURE_PATH")" \
  -F "client_id=$(jq -r '.client_id // empty' "$FIXTURE_PATH")" \
  -F "client_phone=$(jq -r '.client_phone // empty' "$FIXTURE_PATH")" \
  -F "user_id=$(jq -r '.user_id // empty' "$FIXTURE_PATH")" \
  -F "user_name=$(jq -r '.user_name // empty' "$FIXTURE_PATH")" \
  -F "department=$(jq -r '.department // empty' "$FIXTURE_PATH")" \
  -F "brand=$(jq -r '.brand // empty' "$FIXTURE_PATH")" \
  -F "call_type=$(jq -r '.call_type // empty' "$FIXTURE_PATH")" \
  -F "deal_id=$(jq -r '.deal_id // empty' "$FIXTURE_PATH")" \
  -F "deal_type=$(jq -r '.deal_type // empty' "$FIXTURE_PATH")" \
  -F "deal_source=$(jq -r '.deal_source // empty' "$FIXTURE_PATH")" \
  -F "product_type=$(jq -r '.product_type // empty' "$FIXTURE_PATH")" \
  -F "region=$(jq -r '.region // empty' "$FIXTURE_PATH")" \
  -F "user_notes=$(jq -r '.user_notes // empty' "$FIXTURE_PATH")" \
  -F "disapprove_reason=$(jq -r '.disapprove_reason // empty' "$FIXTURE_PATH")" \
  -F "lead_status=$(jq -r '.lead_status // empty' "$FIXTURE_PATH")" \
  -F "lead_ammount=$(jq -r '.lead_ammount // empty' "$FIXTURE_PATH")" \
  -F "tag=$(jq -r '.tag // empty' "$FIXTURE_PATH")" \
  -F "transcription=$(jq -r '.transcription // empty' "$FIXTURE_PATH")" \
  -F "duration_seconds=$(jq -r '.duration_seconds // empty' "$FIXTURE_PATH")"

echo
