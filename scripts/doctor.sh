#!/usr/bin/env bash
# Local setup health check for the Revive Studios website.
# Safe to run before anything is configured:  bash scripts/doctor.sh
# Or via:  just doctor
set -uo pipefail

REQUIRED_NODE="22.12.0"
fail=0

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=1; }
note() { printf '    %s\n' "$1"; }
info() { printf '  \033[33m•\033[0m %s\n' "$1"; }

echo ""
echo "Checking your setup for the Revive Studios website..."
echo ""

# 1. just (needed to run the recipes)
if command -v just >/dev/null 2>&1; then
  ok "just is installed"
else
  bad "just is not installed (needed to run project commands)"
  note "Install it with: brew install just"
fi

# 2. Node >= REQUIRED_NODE
have_node="$(node -v 2>/dev/null | sed 's/^v//')"
if [ -z "$have_node" ]; then
  bad "Node.js is not installed (need >= $REQUIRED_NODE)"
  note "Install the LTS version from https://nodejs.org"
elif [ "$(printf '%s\n%s\n' "$REQUIRED_NODE" "$have_node" | sort -V | head -1)" != "$REQUIRED_NODE" ]; then
  bad "Node.js $have_node is too old (need >= $REQUIRED_NODE)"
  note "Update Node from https://nodejs.org"
else
  ok "Node.js $have_node (>= $REQUIRED_NODE)"
fi

# 3. direnv installed
direnv_installed=0
if command -v direnv >/dev/null 2>&1; then
  direnv_installed=1
  ok "direnv is installed"
else
  bad "direnv is not installed (loads your environment variables automatically)"
  note "Install it with: brew install direnv"
  note "Then add this to ~/.zshrc:  eval \"\$(direnv hook zsh)\""
  note "Then restart your terminal."
fi

# 4. direnv actually loading this folder.
#    CLOUDFLARE_ACCOUNT_ID lives in the committed .env; if it's not in the
#    environment, direnv isn't loading (not hooked into the shell, or not allowed).
if [ "$direnv_installed" -eq 1 ]; then
  if [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
    ok "direnv is loading this folder"
  else
    bad "direnv isn't loading this folder"
    note "Make sure the hook is in ~/.zshrc:  eval \"\$(direnv hook zsh)\""
    note "Restart your terminal, then run:  direnv allow"
  fi
fi

# 5. .env.local present with a token
if [ -f .env.local ] && grep -q '^CLOUDFLARE_API_TOKEN=..*' .env.local 2>/dev/null; then
  ok ".env.local has a Cloudflare API token"
else
  bad ".env.local with your Cloudflare API token is missing"
  note "Create it:  cp .env.example .env.local"
  note "Then put your own token in it:  CLOUDFLARE_API_TOKEN=your-token-here"
  note "Get a token (or ask Trent) at https://dash.cloudflare.com/profile/api-tokens"
  note "(permission: 'Cloudflare Pages: Edit'). Then run:  direnv allow"
fi

# 6. git (required), curl (optional), jj (production only)
if command -v git >/dev/null 2>&1; then
  ok "git is installed"
else
  bad "git is not installed"
  note "Install it with: brew install git"
fi

if command -v curl >/dev/null 2>&1; then
  ok "curl is installed"
else
  info "curl not found (optional; deploys still work, token check is skipped)"
fi

if command -v jj >/dev/null 2>&1; then
  ok "jj is installed"
else
  info "jj not found (only needed for production releases, not for dev/staging)"
fi

echo ""
if [ "$fail" -eq 0 ]; then
  printf '\033[32mAll set. You are ready to edit and deploy to dev/staging.\033[0m\n'
  echo ""
  exit 0
else
  printf '\033[31mSome things need attention. Fix the ✗ items above, then run this again.\033[0m\n'
  echo ""
  exit 1
fi
