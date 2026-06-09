# Revive Studios Website

# Development
dev:
    npm run dev

build:
    npm run build

preview: build
    npm run preview

# Check that your machine is set up correctly (run this first)
doctor:
    bash scripts/doctor.sh

# Local testing with Pages Functions (Turnstile + Resend)
serve: _preflight-auth build
    npx wrangler pages dev dist

# Deployment
deploy-dev: _preflight-auth build
    npx wrangler pages deploy dist --project-name revive-web --branch dev

deploy-staging: _preflight-auth build
    npx wrangler pages deploy dist --project-name revive-web --branch staging

# Emergency direct production deploy (fallback for when GitHub Actions is unavailable).
# Releases normally go through the "Release" workflow in GitHub Actions, which bumps the
# version, tags, and lets the tag-triggered pipeline publish. This recipe just publishes
# the current content to production with NO version bump and NO tag.
deploy-production: _preflight-auth
    #!/usr/bin/env bash
    set -euo pipefail

    # Production safety guard
    echo "⚠ You are about to publish to the LIVE production site (revivestudiosut.com)."
    echo "  Note: this is the emergency fallback. Prefer the GitHub Actions 'Release' workflow,"
    echo "  which bumps the version and tags the release. This recipe does neither."
    read -r -p "Type 'yes' to continue: " confirm
    [ "$confirm" = "yes" ] || { echo "Aborted. Nothing was published."; exit 1; }

    npm run build
    npx wrangler pages deploy dist --project-name revive-web --branch main
    echo "✓ Deployed current content to production (no version bump, no tag)."

# Cloudflare logs
logs-preview: _preflight-auth
    npx wrangler pages deployment tail --project-name revive-web --environment preview

logs-production: _preflight-auth
    npx wrangler pages deployment tail --project-name revive-web --environment production

# Setup
install:
    npm install

clean:
    rm -rf dist .astro node_modules

# Internal: verify Cloudflare auth before any wrangler command
_preflight-auth:
    #!/usr/bin/env bash
    set -euo pipefail

    fail() {
      echo ""
      echo "✗ Cloudflare authentication is not set up."
      echo ""
      echo "  One-time setup:"
      echo "  1. Get your Cloudflare API token (ask Trent, or create one at"
      echo "     https://dash.cloudflare.com/profile/api-tokens -> Create Token"
      echo "     -> permission 'Cloudflare Pages: Edit')."
      echo "  2. Create a file named '.env.local' in the project with:"
      echo "       CLOUDFLARE_API_TOKEN=your-token-here"
      echo "  3. Run: direnv allow"
      echo "  4. Try again."
      echo ""
      echo "  (The account ID is already in .env, you only need the token.)"
      echo ""
      exit 1
    }

    [ -n "${CLOUDFLARE_API_TOKEN:-}" ] || { echo "✗ CLOUDFLARE_API_TOKEN is missing or empty."; fail; }
    [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] || { echo "✗ CLOUDFLARE_ACCOUNT_ID is missing, your env file isn't loading. Run 'just doctor' to diagnose (likely direnv not hooked or not allowed), then 'direnv allow'."; exit 1; }

    if ! command -v curl >/dev/null 2>&1; then
      echo "⚠ curl not found, skipping online token check (credentials are present)."
      exit 0
    fi

    # No -f, so an error body is still captured and "success":false correctly blocks.
    resp="$(curl -sS --max-time 10 -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      "https://api.cloudflare.com/client/v4/user/tokens/verify" 2>/dev/null || true)"

    if [ -z "$resp" ]; then
      echo "⚠ Couldn't reach Cloudflare to verify the token (network?). Continuing; wrangler will report any real auth error."
      exit 0
    fi

    if echo "$resp" | grep -q '"success":true'; then
      echo "✓ Cloudflare token verified."
      exit 0
    else
      echo "✗ Cloudflare rejected the token (it may be expired, revoked, or mistyped)."
      fail
    fi
