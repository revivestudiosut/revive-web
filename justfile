# Revive Studios Website

# Development
dev:
    npm run dev

build:
    npm run build

preview: build
    npm run preview

# Local testing with Pages Functions (Turnstile + Resend)
serve: build
    npx wrangler pages dev dist

# Deployment
deploy-dev: build
    npx wrangler pages deploy dist --project-name revive-web --branch dev

deploy-staging: build
    npx wrangler pages deploy dist --project-name revive-web --branch staging

deploy-production:
    #!/usr/bin/env bash
    set -euo pipefail
    npm version patch --no-git-tag-version
    VERSION=$(node -p "require('./package.json').version")
    jj commit -m "release v$VERSION"
    git tag "v$VERSION"
    npm run build
    npx wrangler pages deploy dist --project-name revive-web --branch main
    echo "✓ Released and deployed v$VERSION (tag created locally; push with: git push origin v$VERSION)"

# Cloudflare logs
logs-preview:
    npx wrangler pages deployment tail --project-name revive-web --environment preview

logs-production:
    npx wrangler pages deployment tail --project-name revive-web --environment production

# Setup
install:
    npm install

clean:
    rm -rf dist .astro node_modules
