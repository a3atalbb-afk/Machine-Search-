#!/bin/bash
# ============================================================
# MACHINE SEARCH — Sync root → www/
# Root is source of truth. This copies files to www/ for Capacitor.
# ============================================================

set -e

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
DST_DIR="$SRC_DIR/www"

echo "🔄 Syncing root → www/..."

# Ensure www/ exists
mkdir -p "$DST_DIR"

# Files to copy (only what's needed by the app)
FILES=(
  # HTML pages
  "index.html"
  "search.html"
  "details.html"
  "favorites.html"
  "history.html"
  "import.html"
  "settings.html"
  "info.html"
  "database.html"
  "about.html"
  "update.html"
  "troubleshoot.html"
  "preview.html"
  "logo.html"
  # JavaScript
  "app.js"
  "excel-parser.js"
  # CSS
  "brand.css"
  "components.css"
  "bg.css"
  "styles.css"
  # Config
  "appicon.png"
)

# Copy files
for f in "${FILES[@]}"; do
  if [ -f "$SRC_DIR/$f" ]; then
    cp "$SRC_DIR/$f" "$DST_DIR/$f"
    echo "  ✓ $f"
  else
    echo "  ⚠ $f (not found, skipped)"
  fi
done

# Copy folders
for d in "assets" "data" "lib"; do
  if [ -d "$SRC_DIR/$d" ]; then
    mkdir -p "$DST_DIR/$d"
    cp -r "$SRC_DIR/$d"/* "$DST_DIR/$d/" 2>/dev/null || true
    echo "  ✓ $d/"
  fi
done

echo ""
echo "✅ Sync complete!"
echo "   Source: $SRC_DIR"
echo "   Dest:   $DST_DIR"
echo ""
echo "Next steps:"
echo "  npx cap sync android"
echo "  npx cap open android"
