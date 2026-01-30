#!/bin/bash
# Production Build & Deployment Script
# For Render or Railway deployment

echo "🚀 Building for Production..."

# 1. Install dependencies
cd backend
npm install --production
cd ..

# 2. Build Frontend
npm run build

echo "✅ Build complete!"
echo "📁 Frontend: dist/"
echo "📁 Backend: backend/"
