#!/bin/bash

# --- CONFIGURATION ---
PROJECT_DIR="/volume1/docker/portfolio/MyPortfolio"
LOG_FILE="$PROJECT_DIR/deploy_log.txt"

# Redirect all output to a log file for debugging
exec > >(tee -a "$LOG_FILE") 2>&1

echo "---------------------------------"
echo "Job started at: $(date)"

# 1. Fix Git 'Dubious Ownership' error for Synology Root user
# This allows root to manage the folder owned by your user
/usr/bin/git config --global --add safe.directory "$PROJECT_DIR"

# 2. Navigate to project folder
cd "$PROJECT_DIR" || { echo "❌ Failed to cd to $PROJECT_DIR"; exit 1; }

# 3. Fetch latest info
/usr/bin/git fetch origin

# 4. Compare Local vs Remote
LOCAL=$(/usr/bin/git rev-parse HEAD)
REMOTE=$(/usr/bin/git rev-parse origin/main) # Assuming 'main' is your branch

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "🚀 New update found! (Local: $LOCAL vs Remote: $REMOTE)"
    
    # --- CRITICAL FIX: FORCE RESET ---
    # This overwrites local changes to match GitHub exactly.
    # It fixes the "untracked working tree files" error.
    /usr/bin/git reset --hard origin/main
    
    # Rebuild
    if [ -f /usr/local/bin/docker-compose ]; then
        echo "Using docker-compose (v1)..."
        /usr/local/bin/docker-compose up -d --build
    else
        echo "Using docker compose (v2)..."
        /usr/local/bin/docker compose up -d --build
    fi
    
    # Clean up unused images
    /usr/local/bin/docker image prune -f
    
    echo "✅ Update deployment complete."
else
    echo "💤 No updates found. Standing by."
fi

echo "Job finished at: $(date)"