#!/bin/bash

# Git Submit Script - Stage, Commit, and Push
# Usage: ./git-submit.sh "Your commit message"

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if commit message is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Commit message required${NC}"
    echo "Usage: ./git-submit.sh \"Your commit message\""
    exit 1
fi

COMMIT_MSG="$1"

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo -e "${BLUE}🔍 Current branch: ${BRANCH}${NC}"
echo ""

# Show status
echo -e "${BLUE}📋 Git Status:${NC}"
git status --short
echo ""

# Show what will be committed
echo -e "${BLUE}📦 Staging all changes...${NC}"
git add -A
echo ""

# Show staged changes
echo -e "${BLUE}✅ Staged changes:${NC}"
git status --short
echo ""

# Commit with custom message and Claude Code attribution
echo -e "${BLUE}💾 Creating commit...${NC}"
git commit -m "$(cat <<EOF
${COMMIT_MSG}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
echo ""

# Push to remote
echo -e "${BLUE}🚀 Pushing to origin/${BRANCH}...${NC}"
git push origin "${BRANCH}"
echo ""

echo -e "${GREEN}✨ Successfully committed and pushed!${NC}"
