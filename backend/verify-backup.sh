#!/bin/bash

# ============================================
# 🔐 Automatic Database Backup Setup
# Script to verify and test backup system
# ============================================

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Bint Alyemen - Database Backup System Verification    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if node-cron is installed
echo "1️⃣  Checking if node-cron is installed..."
cd backend
if npm list node-cron | grep -q "node-cron"; then
    echo -e "${GREEN}✅ node-cron is installed${NC}"
else
    echo -e "${RED}❌ node-cron is NOT installed${NC}"
    echo "   Installing node-cron..."
    npm install node-cron
fi

echo ""

# Check if backup.js exists
echo "2️⃣  Checking if backup.js exists..."
if [ -f "backup.js" ]; then
    echo -e "${GREEN}✅ backup.js found${NC}"
else
    echo -e "${RED}❌ backup.js NOT found${NC}"
fi

echo ""

# Check if backups directory exists
echo "3️⃣  Checking if backups directory exists..."
if [ -d "backups" ]; then
    echo -e "${GREEN}✅ backups directory found${NC}"
    echo "   Contents:"
    ls -1 backups/ | while read file; do
        echo "      - $file"
    done
else
    echo -e "${YELLOW}⚠️  backups directory NOT found, creating it...${NC}"
    mkdir -p backups
    echo -e "${GREEN}✅ backups directory created${NC}"
fi

echo ""

# Check if database exists
echo "4️⃣  Checking if database exists..."
if [ -f "database/store.db" ]; then
    db_size=$(du -h database/store.db | cut -f1)
    echo -e "${GREEN}✅ database/store.db found (Size: $db_size)${NC}"
else
    echo -e "${RED}❌ database/store.db NOT found${NC}"
fi

echo ""

# Test manual backup
echo "5️⃣  Testing manual backup..."
node backup.js

echo ""

# List backups
echo "6️⃣  Listing available backups..."
node backup.js list

echo ""

# Show backup directory location
echo "7️⃣  Backup directory location:"
echo "   📁 $(pwd)/backups/"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Setup Complete!                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Start the server: npm run dev"
echo "  2. Server will automatically backup at 2:00 AM daily"
echo "  3. For manual backup: npm run backup"
echo "  4. View backups: npm run backup:list"
echo ""
