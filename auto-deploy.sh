#!/bin/bash

# 1. Navigate to your project folder
# CHANGE THIS PATH to your actual project folder
cd /volume1/docker/portfolio/MyPortfolio

# 2. Fetch the latest info from GitHub (without downloading code yet)
/usr/bin/git fetch

# 3. Check if your local version (HEAD) is different from the GitHub version (@{u})
LOCAL=$(/usr/bin/git rev-parse HEAD)
REMOTE=$(/usr/bin/git rev-parse @{u})

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "🚀 New update found on GitHub! Starting deployment..."
    
    # Pull the new code
    /usr/bin/git pull
    
    # Rebuild and restart the container
    # Note: DSM 7.2+ uses 'docker-compose' or 'docker compose'. 
    # We use the full path to be safe.
    if [ -f /usr/local/bin/docker-compose ]; then
        /usr/local/bin/docker-compose up -d --build
    else
        docker compose up -d --build
    fi
    
    echo "✅ Update complete."
else
    echo "💤 No updates found. Standing by."
fi