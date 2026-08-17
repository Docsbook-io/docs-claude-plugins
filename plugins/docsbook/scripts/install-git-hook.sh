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
# pre-push hook installed by the docsbook plugin.
# Runs /docsbook:run-docs-sync before a push so the markdown reflects the code
# that is about to ship.
#
# DOCS_SYNC_MODE=warn   (default) run it, report, never block.
# DOCS_SYNC_MODE=block            exit 1 if drift was found OR the run failed.
# DOCS_SYNC_MODE=off              do nothing.
# DOCS_SYNC_SKIP=1                same as off, for one push. Kept because it is
#                                 already documented and in people's fingers.
set -e

MODE="${DOCS_SYNC_MODE:-warn}"
if [ "${DOCS_SYNC_SKIP:-0}" = "1" ] || [ "$MODE" = "off" ]; then
  echo "[docs-sync] skipped"
  exit 0
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "[docs-sync] claude CLI not found — skipping doc sync."
  echo "[docs-sync] install: https://claude.com/claude-code"
  exit 0
fi

echo "[docs-sync] running /docsbook:run-docs-sync (mode=$MODE)..."

# Capture the output, because block mode has to react to DRIFT and not merely to
# the process falling over. The previous version only checked `claude`'s exit
# code, so a successful run that found ten drifted pages exited 0 and block mode
# waved it through — the exact case the mode exists for. The command prints a
# `DOCS_SYNC_DRIFT: <n>` line as its machine-readable verdict.
OUTPUT=""
if OUTPUT=$(claude --print --dangerously-skip-permissions /docsbook:run-docs-sync 2>&1); then
  RAN=0
else
  RAN=$?
fi
printf '%s\n' "$OUTPUT"

DRIFT=$(printf '%s' "$OUTPUT" | sed -n 's/.*DOCS_SYNC_DRIFT:[[:space:]]*\([0-9][0-9]*\).*/\1/p' | tail -1)
DRIFT="${DRIFT:-0}"

if [ "$MODE" = "block" ]; then
  if [ "$RAN" -ne 0 ]; then
    echo "[docs-sync] run failed and mode=block — push aborted." >&2
    exit 1
  fi
  if [ "$DRIFT" -gt 0 ]; then
    echo "[docs-sync] $DRIFT drifted page(s) and mode=block — push aborted." >&2
    echo "[docs-sync] commit the doc updates, or push once with DOCS_SYNC_MODE=warn." >&2
    exit 1
  fi
fi

if [ "$RAN" -ne 0 ]; then
  echo "[docs-sync] run failed — push continues (mode=$MODE)."
elif [ "$DRIFT" -gt 0 ]; then
  echo "[docs-sync] $DRIFT drifted page(s) — push continues (mode=$MODE)."
else
  echo "[docs-sync] no drift"
fi
exit 0
HOOK

chmod +x "$HOOK_PATH"
echo "✓ installed $HOOK_PATH"
echo
echo "Next: try \`git push\` (use DOCS_SYNC_SKIP=1 git push to skip once)."
