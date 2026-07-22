#!/bin/bash

# Gambling Blocklist Deployment Script
# This script deploys the gambling blocklist to Cloudflare Workers

set -e

echo "🎰 Gambling Blocklist Deployment"
echo "================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler is not installed. Installing..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run: wrangler login"
    exit 1
fi

echo "✅ Wrangler is installed and logged in"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please edit .env file with your configuration"
        exit 1
    else
        echo "❌ .env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Source environment variables
source .env

# Check required environment variables
if [ -z "$OMNIROUTE_API_KEY" ] || [ -z "$OMNIROUTE_ENDPOINT" ]; then
    echo "❌ Missing required environment variables in .env"
    echo "   Please set OMNIROUTE_API_KEY and OMNIROUTE_ENDPOINT"
    exit 1
fi

echo "✅ Environment variables loaded"

# Build the project
echo "🔨 Building project..."
npm run build

# Check if KV namespace exists
echo "🔍 Checking KV namespace..."
KV_ID=$(grep -A 3 "BLOCKLIST_KV" wrangler.jsonc | grep "id" | cut -d'"' -f4)

if [ -z "$KV_ID" ] || [ "$KV_ID" = "YOUR_KV_NAMESPACE_ID_HERE" ]; then
    echo "⚠️  KV namespace not configured. Creating new namespace..."
    KV_ID=$(wrangler kv:namespace create BLOCKLIST_KV | grep -o '"id": "[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$KV_ID" ]; then
        echo "❌ Failed to create KV namespace"
        exit 1
    fi
    
    echo "📝 KV namespace created with ID: $KV_ID"
    echo "   Please update wrangler.jsonc with this ID"
    
    # Update wrangler.jsonc
    sed -i "s/YOUR_KV_NAMESPACE_ID_HERE/$KV_ID/g" wrangler.jsonc
    echo "✅ Updated wrangler.jsonc with KV namespace ID"
fi

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
npm run deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify deployment at your Cloudflare Workers dashboard"
echo "   2. Test the API endpoints"
echo "   3. Configure AdGuard Home to use your blocklist URL"
echo ""
echo "🔗 API Endpoints:"
echo "   - Status: https://your-worker.dev/api/status"
echo "   - Blocklist: https://your-worker.dev/api/blocklist"
echo "   - Update: https://your-worker.dev/api/update"