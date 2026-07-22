#!/bin/bash

# Gambling Blocklist Setup Script
# This script sets up the development environment

set -e

echo "🎰 Gambling Blocklist Setup"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ git is not installed"
    exit 1
fi

echo "✅ git $(git --version | cut -d' ' -f3) is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler is not installed. Installing..."
    npm install -g wrangler
fi

echo "✅ Wrangler is installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created"
        echo "   Please edit .env with your configuration"
    else
        echo "⚠️  .env.example not found"
    fi
fi

# Check if wrangler is logged in
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare"
    echo "   Please run: wrangler login"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your configuration"
echo "   2. Run: wrangler login (if not already logged in)"
echo "   3. Run: ./scripts/deploy.sh to deploy"
echo ""
echo "🔧 Development commands:"
echo "   - npm run dev        Start development server"
echo "   - npm test           Run tests"
echo "   - npm run lint       Run linting"
echo "   - npm run build      Build project"
echo "   - npm run deploy     Deploy to Cloudflare"