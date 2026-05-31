---
name: LoanGo environment quirks
description: Critical env issues that broke build and workflow startup
---

## pnpm version mismatch
root `package.json` had `"packageManager": "pnpm@9.15.0"` but the Nix environment provides pnpm 10.26.1. This triggers pnpm's self-install loop and every `pnpm run` command fails with repeated `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`. Fix: keep `packageManager` set to `pnpm@10.26.1`.

**Why:** Corepack/pnpm's packageManager field triggers auto-install of the declared version; mismatches cause a self-install loop that fails silently.

**How to apply:** After any dependency update or rebase, verify root package.json `packageManager` matches `pnpm --version` output.

## Workflow PORT env var
Both artifacts require an explicit PORT env var in the workflow command:
- API Server: `PORT=3000 pnpm --filter @workspace/api-server run dev`  (listens on 3000)
- Mobile App: `PORT=18115 pnpm --filter @workspace/mobile run dev`  (matches artifact.toml localPort=18115)

The mobile app's dev script passes `$PORT` to expo start; if PORT is not set the flag is empty and expo fails with "option requires argument: --port".
