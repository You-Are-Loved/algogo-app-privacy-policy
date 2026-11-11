#!/usr/bin/env bash
# Re-verifies every problem batch under src/data/more against the reference
# solutions, fixes and traps stored in scripts/fixtures. Run from the repo root:
#   bash scripts/verify-fixtures.sh
# Java fixes are compiled when `javac` is on PATH; Kotlin fixes when KOTLINC
# points at a kotlinc binary (otherwise the verifier warns and skips compiling).
# The "numbers must be contiguous" / "duplicate" structural messages are
# expected once a batch is part of the shipped catalog, hence --skip-existing.
set -u
cd "$(dirname "$0")/.."
SN=node_modules/.bin/sucrase-node
fail=0
run() { # label, command...
  local label=$1; shift
  local out; out=$("$@" 2>&1); local line
  line=$(printf '%s\n' "$out" | grep -E '^[0-9]+ problems, ' | tail -1)
  local errs; errs=$(printf '%s\n' "$out" | grep -E '^[0-9]+ errors' | tail -1)
  printf '%-18s %s | %s\n' "$label" "$line" "$errs"
  [ "$errs" = "0 errors" ] || { fail=1; printf '%s\n' "$out" | grep -E '^(ERROR|WARN)' | head -10; }
}
for f in scripts/fixtures/algos-*.py; do b=$(basename "$f" .py); run "$b" $SN scripts/verify-algos.ts "src/data/more/$b.ts" "$f" --skip-existing; done
for f in scripts/fixtures/{py,js,node,java,kotlin}-*.ts; do [ -e "$f" ] && run "$(basename "$f" .ts)" $SN scripts/verify-bugfix.ts "$f" --skip-existing; done
for f in scripts/fixtures/sql-*.ts; do run "$(basename "$f" .ts)" $SN scripts/verify-sql.ts "$f" --skip-existing; done
for f in scripts/fixtures/react-*.ts; do run "$(basename "$f" .ts)" $SN scripts/verify-react.ts "$f" --skip-existing; done
exit $fail
