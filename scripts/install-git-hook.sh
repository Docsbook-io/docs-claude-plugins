#!/usr/bin/env bash
# install-git-hook.sh — installs the docs-sync pre-push git hook.
# Designed to be run once after `/plugin install docs-sync@docsbook-io`.
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/Docsbook-io/docs-claude-plugins/main/scripts/install-git-hook.sh)
#   # or from a checked-out plugin:
#   bash scripts/install-git-hook.sh

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "[docs-sync] error: not inside a git repository" >&2
  exit 1
fi

HOOK_PATH="$REPO_ROOT/.git/hooks/pre-push"
MARKER="# pre-push hook installed by docs-sync"

# Backup any non-docs-sync hook
if [ -e "$HOOK_PATH" ] && ! grep -q "$MARKER" "$HOOK_PATH" 2>/dev/null; then
  BACKUP="${HOOK_PATH}.backup-$(date +%s)"
  mv "$HOOK_PATH" "$BACKUP"
  echo "[docs-sync] backed up existing pre-push → $BACKUP"
fi

cat > "$HOOK_PATH" <<'HOOK'
#!/usr/bin/env bash
# pre-push hook installed by docs-sync
# Calls the /docs-sync slash command via claude CLI.
# Never blocks push in warn mode (default).
#
# Disable temporarily: DOCS_SYNC_SKIP=1 git push
# Force block mode:    DOCS_SYNC_MODE=block git push
set -e

if [ "${DOCS_SYNC_SKIP:-0}" = "1" ]; then
  echo "[docs-sync] skipped via DOCS_SYNC_SKIP=1"
  exit 0
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "[docs-sync] claude CLI not found — skipping doc sync."
  echo "[docs-sync] install: https://claude.com/claude-code"
  exit 0
fi

MODE="${DOCS_SYNC_MODE:-warn}"
echo "[docs-sync] running /docs-sync (mode=$MODE)..."

if claude --print --dangerously-skip-permissions /docs-sync; then
  echo "[docs-sync] done"
  exit 0
fi

if [ "$MODE" = "block" ]; then
  echo "[docs-sync] FAILED in block mode — push aborted." >&2
  exit 1
fi

echo "[docs-sync] failed — push will continue (warn mode)."
exit 0
HOOK

chmod +x "$HOOK_PATH"
echo "✓ installed $HOOK_PATH"
echo
echo "Next: try \`git push\` (use DOCS_SYNC_SKIP=1 git push to skip once)."
