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

deploy-production: build
    npx wrangler pages deploy dist --project-name revive-web --branch main

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
