#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "== Claude-code-laohuang legacy Mac installer =="
echo

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer is for macOS only."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required but not found."
  exit 1
fi

ensure_bun() {
  if command -v bun >/dev/null 2>&1; then
    return 0
  fi

  echo "Bun not found. Installing Bun..."
  curl -fsSL https://bun.sh/install | bash

  export PATH="$HOME/.bun/bin:$PATH"
  if ! command -v bun >/dev/null 2>&1; then
    echo "Bun installation finished, but bun is still not in PATH."
    echo "Try reopening Terminal and rerun this installer."
    exit 1
  fi
}

ensure_env_file() {
  if [[ ! -f ".env" ]]; then
    cp .env.example .env
    echo "Created .env from .env.example"
  fi
}

env_needs_setup() {
  grep -q "your_api_key_here\\|your-model-name\\|your-anthropic-compatible-endpoint.example.com" .env
}

ensure_bun

echo "Installing project dependencies with Bun..."
bun install
echo

ensure_env_file

if env_needs_setup; then
  echo "Your API configuration is still empty."
  if [[ "${CLAUDE_CODE_SKIP_OPEN:-0}" == "1" ]]; then
    echo "Skipping TextEdit because CLAUDE_CODE_SKIP_OPEN=1"
  else
    echo "Opening .env in TextEdit. Fill in your API settings, save, then rerun this installer or the launcher."
    open -a TextEdit "$ROOT_DIR/.env"
  fi
  exit 0
fi

if [[ ! -f "$HOME/Desktop/Claude-code-laohuang.command" ]]; then
  cat > "$HOME/Desktop/Claude-code-laohuang.command" <<EOF
#!/usr/bin/env bash
cd "$ROOT_DIR"
exec ./bin/claude-code-laohuang
EOF
  chmod +x "$HOME/Desktop/Claude-code-laohuang.command"
  echo "Desktop launcher created: $HOME/Desktop/Claude-code-laohuang.command"
fi

echo "Starting Claude-code-laohuang..."
if [[ "${CLAUDE_CODE_SKIP_LAUNCH:-0}" == "1" ]]; then
  echo "Skipping launch because CLAUDE_CODE_SKIP_LAUNCH=1"
  exit 0
fi

exec ./bin/claude-code-laohuang
