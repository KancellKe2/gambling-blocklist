#!/bin/bash

# Gambling Blocklist Update Script
# This script triggers a manual update of the blocklist

set -e

echo "🔄 Gambling Blocklist Update"
echo "=========================="

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

# Get worker URL
WORKER_URL=$(grep -o 'name = "[^"]*"' wrangler.jsonc | head -1 | cut -d'"' -f2)

if [ -z "$WORKER_URL" ]; then
    echo "❌ Could not determine worker name from wrangler.jsonc"
    exit 1
fi

echo "🔍 Worker name: $WORKER_URL"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Using default configuration..."
fi

# Trigger update via API
echo "🚀 Triggering blocklist update..."

# Try to use curl to trigger update
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s -X POST "https://$WORKER_URL.workers.dev/api/update")
    echo "📡 Response: $RESPONSE"
else
    echo "⚠️  curl not found. Using wrangler to trigger update..."
    # Alternative: use wrangler to trigger the cron job
    wrangler cron create "update-blocklist" "0 * * * *" --compatibility-date 2024-01-01
fi

echo ""
echo "✅ Update triggered!"
echo ""
echo "📋 Check status:"
echo "   - API Status: https://$WORKER_URL.workers.dev/api/status"
echo "   - Blocklist: https://$WORKER_URL.workers.dev/api/blocklist"
echo ""
echo "⏳ The update may take a few minutes to complete."