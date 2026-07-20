#!/bin/bash

# Hipotesa Journal - Deploy Script
# Usage: ./deploy.sh

echo "📦 Building frontend..."
npm run build

echo "🚀 Starting production server..."
NODE_ENV=production npm run server
