#!/usr/bin/env bash
# pre-tool-git-push-docs-sync.sh
# EVENT: PreToolUse (matcher: Bash)
# DESCRIPTION: Перехватывает `git push` ДО выполнения и напоминает Клоду
# сначала запустить subagent docs-sync:docs-sync в текущей сессии — чтобы
# синхронизировать markdown в docs/ с изменениями кода, которые сейчас
# улетят в remote.
#
# Логика:
#   1. Срабатывает только на Bash-вызовы с командой git push.
#   2. Если есть префикс DOCS_SYNC_DONE=1 в команде — пропускает.
#   3. Если в /tmp/.docs-sync-done-<session_id> лежит маркер — одноразово пропускает.
#   4. Иначе — exit 2 + stderr с инструкцией для Клода.
#
# Configure:
#   DOCS_SYNC_SKIP=1          — отключить хук полностью (в env Claude Code)
#   DOCS_SYNC_DONE=1 git push — обойти ОДНУ конкретную команду push
#
# Маркер /tmp/.docs-sync-done-<session_id> создаётся самим Клодом
# (или slash-командой /docs-sync) после успешного прогона docs-sync, чтобы
# последующий push в той же сессии прошёл без повторного напоминания.

set -e

if [ "${DOCS_SYNC_SKIP:-0}" = "1" ]; then
  exit 0
fi

INPUT=$(cat)

TOOL_NAME=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    print(json.load(sys.stdin).get('tool_name', ''))
except Exception:
    pass
" 2>/dev/null)

if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

CMD=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    print(json.load(sys.stdin).get('tool_input', {}).get('command', ''))
except Exception:
    pass
" 2>/dev/null)

# Реагируем только на git push (с любыми аргументами/флагами, в пайплайне, после &&/;/|)
if ! printf '%s' "$CMD" | grep -qE '(^|[;&|]|\s)git\s+push(\s|$)'; then
  exit 0
fi

# Префикс DOCS_SYNC_DONE=1 — обход разовый, на эту команду
if printf '%s' "$CMD" | grep -qE 'DOCS_SYNC_DONE=1'; then
  exit 0
fi

SESSION_ID=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    print(json.load(sys.stdin).get('session_id', 'unknown'))
except Exception:
    pass
" 2>/dev/null)

MARKER="/tmp/.docs-sync-done-${SESSION_ID}"
if [ -f "$MARKER" ]; then
  # Одноразовый маркер — удаляем после использования
  rm -f "$MARKER"
  exit 0
fi

cat >&2 <<'EOF'
🛑 docs-sync guard: git push blocked.

Before pushing, sync the markdown documentation with the code changes you're about
to publish:

  1. Run the `docs-sync:docs-sync` subagent via the Agent tool (or invoke the
     `/docs-sync:docs-sync` slash command). Pass it the diff range, e.g.
     `git diff origin/main...HEAD`, and the repo root.
  2. Wait for the subagent to either update files in docs/ or confirm there is
     no drift.
  3. If it produced edits, commit them (a separate "docs: sync …" commit is fine).
  4. Re-run the SAME push command with the prefix `DOCS_SYNC_DONE=1`, e.g.:
        DOCS_SYNC_DONE=1 git push origin main

Bypass once:    DOCS_SYNC_DONE=1 git push ...
Disable hook:   export DOCS_SYNC_SKIP=1
EOF

exit 2
