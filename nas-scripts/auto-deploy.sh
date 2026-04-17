#!/bin/bash
#
# NAS auto-deploy for MyPortfolio
# ─────────────────────────────────
# Runs on a schedule (e.g. Synology Task Scheduler / cron). Polls origin for
# code changes on $BRANCH. If there is a new commit, fast-forwards the worktree
# and rebuilds the docker-compose stack.
#
# Content updates (content.json / photos.json) do NOT require this script if
# you've set up the content volume mount described in DEPLOYMENT.md — edit
# those files directly on the NAS and the site reflects the change on the
# next browser refresh.

set -u

# --- CONFIGURATION ---
PROJECT_DIR="${PROJECT_DIR:-/volume1/docker/portfolio/MyPortfolio}"
BRANCH="${BRANCH:-main}"
LOG_FILE="$PROJECT_DIR/deploy_log.txt"
MAX_LOG_SIZE=1048576  # 1 MB — rotate beyond this

# Rotate log if it grows too large
if [ -f "$LOG_FILE" ] && [ "$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)" -gt "$MAX_LOG_SIZE" ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
fi

# Redirect all output to a log file for debugging
exec > >(tee -a "$LOG_FILE") 2>&1

echo "---------------------------------"
echo "Job started at: $(date) (branch=$BRANCH)"

# 1. Fix Git 'Dubious Ownership' error for Synology Root user
/usr/bin/git config --global --add safe.directory "$PROJECT_DIR"

# 2. Navigate to project folder
cd "$PROJECT_DIR" || { echo "❌ Failed to cd to $PROJECT_DIR"; exit 1; }

# 3. Fetch latest info
if ! /usr/bin/git fetch origin "$BRANCH"; then
    echo "❌ git fetch failed — aborting."
    exit 1
fi

# 4. Compare Local vs Remote
LOCAL=$(/usr/bin/git rev-parse HEAD)
REMOTE=$(/usr/bin/git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "💤 No updates found. Standing by."
    echo "Job finished at: $(date)"
    exit 0
fi

echo "🚀 New update found! (Local: $LOCAL vs Remote: $REMOTE)"

# 5. Safety: stash any local edits instead of discarding them silently
if [ -n "$(/usr/bin/git status --porcelain)" ]; then
    STASH_MSG="auto-deploy safety stash $(date +%Y-%m-%d_%H-%M-%S)"
    echo "⚠️  Local changes detected — stashing as: $STASH_MSG"
    /usr/bin/git stash push -u -m "$STASH_MSG" || {
        echo "❌ git stash failed — aborting to avoid data loss."
        exit 1
    }
fi

# 6. Fast-forward to remote. Using reset --hard is safe now because we've
#    already stashed any local edits above.
/usr/bin/git reset --hard "origin/$BRANCH"

# 7. Rebuild (docker compose v1 vs v2)
if [ -f /usr/local/bin/docker-compose ]; then
    echo "Using docker-compose (v1)..."
    /usr/local/bin/docker-compose up -d --build
else
    echo "Using docker compose (v2)..."
    /usr/local/bin/docker compose up -d --build
fi

# 8. Clean up unused images
/usr/local/bin/docker image prune -f

echo "✅ Update deployment complete."
echo "Job finished at: $(date)"