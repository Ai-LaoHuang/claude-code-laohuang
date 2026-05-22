#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRIDGE_ROOT="${OPENCLAW_CODEX_BRIDGE_ROOT:-/Users/xiaowo1800gmail.com/Documents/cli/cloudecode/bridge-auto}"
BRIDGE_HOST="${OPENCLAW_CODEX_BRIDGE_HOST:-127.0.0.1}"
BRIDGE_PORT="${OPENCLAW_CODEX_BRIDGE_PORT:-8644}"
BRIDGE_URL="http://${BRIDGE_HOST}:${BRIDGE_PORT}"
BRIDGE_TOKEN="${CLAUDE_CODE_BRIDGE_TOKEN:-openclaw-codex-bridge}"
MODEL="${CLAUDE_CODE_MODEL:-gpt-5.5}"

append_no_proxy() {
  local current="${1:-}"
  local loopback="127.0.0.1,localhost,::1"
  if [[ -n "$current" ]]; then
    printf '%s,%s' "$current" "$loopback"
  else
    printf '%s' "$loopback"
  fi
}

export NO_PROXY="$(append_no_proxy "${NO_PROXY:-}")"
export no_proxy="$(append_no_proxy "${no_proxy:-}")"

if ! python3 - <<PY >/dev/null 2>&1
import urllib.request
urllib.request.urlopen("${BRIDGE_URL}/healthz", timeout=2)
PY
then
  if [[ ! -x "${BRIDGE_ROOT}/openclaw-codex-bridge.sh" ]]; then
    echo "Bridge is not running and launcher was not found: ${BRIDGE_ROOT}/openclaw-codex-bridge.sh" >&2
    exit 1
  fi
  nohup "${BRIDGE_ROOT}/openclaw-codex-bridge.sh" >/dev/null 2>&1 &
  sleep 1
fi

cd "$ROOT_DIR"

export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-$BRIDGE_TOKEN}"
export ANTHROPIC_AUTH_TOKEN="$BRIDGE_TOKEN"
export ANTHROPIC_BASE_URL="$BRIDGE_URL"
export ANTHROPIC_MODEL="$MODEL"
export ANTHROPIC_DEFAULT_SONNET_MODEL="$MODEL"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="$MODEL"
export ANTHROPIC_DEFAULT_OPUS_MODEL="$MODEL"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="${CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC:-1}"

exec ./bin/claude-code-laohuang --model "$MODEL" "$@"
