#!/bin/bash
# Git Bash compatible installation script

echo "🧹 Cleaning old dependencies..."
rm -rf node_modules
rm -f package-lock.json

echo ""
echo "📦 Installing Next.js 16.0.10 and dependencies..."
npm install

echo ""
echo "✅ Done! You can now run: npm run dev"
echo ""
read -p "Press Enter to continue..."
