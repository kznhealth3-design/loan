#!/bin/bash
# Run this script in the Replit Shell to push to GitHub

# 1. Remove the lock file
rm -f .git/config.lock

# 2. Add the GitHub remote
git remote add origin https://github.com/kznhealth3-design/loan.git

# 3. Verify the remote was added
echo "Remotes:"
git remote -v

# 4. Push the main branch
git push -u origin main
