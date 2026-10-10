#!/bin/bash
set -e
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
trap 'echo "The editor could not start. Please send the error above."; read -r -p "Press Return to close."' ERR
cd "$(dirname "$0")"
if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  echo "Install Node.js 24 LTS from https://nodejs.org, then run this launcher again."
  read -r -p "Press Return to close."
  exit 1
fi
node scripts/update.cjs
lock_hash=$(shasum -a 256 package-lock.json | cut -d ' ' -f 1)
installed_hash=$(cat .installed-lock-hash 2>/dev/null || true)
if [ ! -d node_modules ] || [ "$lock_hash" != "$installed_hash" ]; then
  if ! npm ci; then
    echo "Dependency setup failed. Restoring the previous source version if available."
    node scripts/update.cjs --rollback || true
    exit 1
  fi
  echo "$lock_hash" > .installed-lock-hash
fi
npm start
