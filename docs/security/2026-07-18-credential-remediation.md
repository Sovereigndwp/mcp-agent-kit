# Security Incident Record — Credential Remediation

**Repository:** `Sovereigndwp/mcp-agent-kit` (public)
**Date of record:** 2026-07-18
**Incident class:** Credentials committed to local git history (never published)
**Institutional reference:** The Sovereign Academy decision queue item **DQ-P2-11** (Phase Two expedition, 2026-07-18)

## Summary

A routine git-hygiene audit found live third-party credentials (a Notion integration token and Canva Connect API credentials) inside an old commit on a local, never-pushed branch of this repository. GitHub Push Protection blocked the only push attempt that would have published them, so the credentials never reached the public repository. Both integrations were revoked before any history changes were made. The git history was then rewritten from a mirror clone to replace the credential contents with placeholders, obsolete local-only commits were removed, branches were rewritten, and the result was revalidated with a fresh clone and a full-history secret scan. The only findings that remain are two deterministic, fake, educational constants inside the Bitcoin key-generation teaching simulator; these are documented and narrowly allowlisted below. This record exists because the repository's history changed and its security baseline improved — that is an institutional event, not just a code change.

## Timeline

| Date | Event |
|---|---|
| 2025-09-03 | Commit "try commit" (then `8a790b6`) on local branch `clean-main` adds `DEPLOY_NOW.md` containing a live Notion integration token and Canva Connect API credentials. The branch is never pushed. |
| 2026-07-18 | Discovered during The Sovereign Academy's Phase Two git-hygiene sweep. A push of `clean-main` is blocked by GitHub Push Protection; the block is **not** bypassed. Non-destructive safety ref `safety/clean-main-pre-scrub` created. Recorded as decision-queue item DQ-P2-11. Owner ruling: **revoke first, rewrite second.** |
| 2026-07-18 | Owner revokes the Notion integration and the Canva integration. All exposed credentials treated as compromised regardless of whether they were still active. |
| 2026-07-18 | History remediation executed from a mirror clone: credential contents replaced with placeholders throughout history (`git filter-repo` replace-text), obsolete unreachable local commits removed, branches rewritten, `git reflog expire` + `git gc` run, remote updated. |
| 2026-07-18 | Independent fresh-clone verification (separate environment, cloned from origin): full-history gitleaks scan over all 61 reachable commits finds **zero credential findings**; former secret commit `8a790b6` is no longer a valid object; historical `DEPLOY_NOW.md` content contains placeholders only. Incident closed. |

## Findings

**In reachable history (as found by the audit, prior to remediation):**

1. A Notion integration token (revoked 2026-07-18).
2. Canva Connect API credentials — token, key, client ID, client secret (revoked 2026-07-18).
3. Simulated Bitcoin key-generator values in the educational simulator (assessed: not secrets — see Remaining Accepted Findings).
4. Historical documentation (`DEPLOY_NOW.md`) containing the credentials above.

**In local unreachable history:** obsolete commits containing the same revoked credentials (removed during cleanup).

**Risk assessment:** the credentials were never published — GitHub Push Protection blocked the single push attempt, and no other remote ever received the branch. Exposure was limited to the local disk and local git history. They were nonetheless treated as compromised and revoked, because "probably never left the laptop" is not a security boundary.

## Actions Taken

1. **Containment first:** Notion integration revoked; Canva integration revoked; all exposed credentials considered compromised from the moment of discovery.
2. **Preservation before surgery:** safety ref created; untracked and dirty work preserved before any history operation.
3. **Repository cleanup:** local unreachable history removed; git history rewritten from a mirror clone (credential text replaced with placeholders); all affected branches rewritten; `git reflog expire --expire=now --all` and `git gc --prune=now --aggressive` run; Push Protection never bypassed at any point.
4. **Revalidation:** repository re-scanned; clean clone pulled from origin and verified independently.

## Verification

Commands used to validate the cleanup (run them from a **fresh clone**, not the working repository):

```bash
# Fresh clone — the only state that proves what the world can see
git clone https://github.com/Sovereigndwp/mcp-agent-kit.git verify-clone && cd verify-clone

# Full git-history scan (gitleaks >= 8.19 syntax; older versions: gitleaks detect --source .)
gitleaks git .

# Current worktree scan (older versions: gitleaks detect --source . --no-git)
gitleaks dir .

# Confirm the former secret commit no longer exists
git cat-file -t 8a790b6   # must fail: "Not a valid object name"

# Confirm historical documentation is placeholder-only
git log --all --oneline -- DEPLOY_NOW.md
git show <each-listed-commit>:DEPLOY_NOW.md | grep -iE "token|secret|key"

# On the machine where history was rewritten (not needed on fresh clones):
git reflog expire --expire=now --all
git gc --prune=now --aggressive
# History rewrite itself was performed with git filter-repo from a mirror clone.
```

**Independent verification results (2026-07-18, fresh clone from origin, gitleaks with default rules and no allowlist):** 61 commits scanned; 10 findings total, **all** of them the educational simulator constants described below; **zero** credential findings; `8a790b6` not a valid object; historical `DEPLOY_NOW.md` and current `.env.deploy` contain `your_..._here` placeholders only.

**Attestation boundaries (recorded for institutional honesty):** the credential revocations and the local-machine cleanup are owner-attested actions on owner-controlled systems; the published-history verification above was performed independently in a separate environment and is reproducible by anyone with the commands given.

## Remaining Accepted Findings

Secret scanning still fires on exactly **two deterministic constants** in the Bitcoin key-generation teaching simulator, matched by the `generic-api-key` rule:

- `privateKey: E9873D79C6D87DC0FB6A5778633389F4453213303DA61F20BD67FC233AA33262` — the **published example private key from *Mastering Bitcoin*** (Andreas M. Antonopoulos), one of the most widely printed "private keys" in existence.
- `publicKey: 03D4B4A4E1D1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF123456` — a visibly fake `1234567890ABCDEF` pattern.

Verified occurrence counts (they vary with gitleaks version and scan mode, so the class matters more than the number): 10 findings across full history (the two constants in 5 historical file paths: `index.html`, `bitcoin-site/index.html`, `bitcoin-first-principles-fixed.html`, `docs/index.html`, `educational-content/bitcoin-course/bitcoin-first-principles.html`) and 6 in the current worktree (the first 3 files).

These values are **deterministic, fake, educational, never used for real funds, and intentionally embedded for teaching** — the simulator shows learners what a keypair looks like without generating real entropy. They are hereby recorded as **accepted security exceptions** and are allowlisted **by exact value only** in `.gitleaks.toml`. No rule is disabled; no path is exempted; any new secret-like value anywhere in this repository still fails the scan (verified with a planted-secret negative control on 2026-07-18).

Note: `security-report.txt` at the repository root is the output of an earlier ad-hoc scanner and predates this baseline; its "secret-logging" entries are noise unrelated to this incident. Candidate for archival at next cleanup.

## Preventive Measures

1. **`.gitleaks.toml`** — default rules fully active; only the two simulator constants allowlisted by value.
2. **`docs/security/SECRETS_POLICY.md`** — what may never be committed, and what educational mock values are allowed.
3. **`SECURITY.md`** — vulnerability reporting, response process, and the credential-exposure policy (revoke first, rewrite second).
4. **Pre-commit scanning** — `.pre-commit-config.yaml` runs gitleaks on every commit; installation documented in the secrets policy.
5. **GitHub Push Protection stays enabled** — it worked. It is never to be bypassed; a blocked push is a stop-and-investigate event.
6. **Institutional cadence** — secret scanning is part of The Sovereign Academy's weekly git-hygiene sweep and quarterly preservation verification (see `tsa:institution/OPERATING-RHYTHM.md`), so detection is now normal repository governance rather than an ad-hoc event.

## Operational Lessons

1. Never commit temporary credentials — "I'll remove it before pushing" is how this incident started.
2. **Revoke first, rewrite second.** History surgery with live credentials still valid protects nothing.
3. Rewrite history from a **mirror clone**, never from a working repository.
4. **Preserve untracked and dirty work before any history operation** (this institution has lost work to a careless `reset --hard` before — see DQ-P2-12).
5. Verify with a **fresh clone** after rewriting; the repository you operated on cannot vouch for itself.
6. **Distinguish real secrets from educational simulations before suppressing scanner findings** — and then suppress by exact value, never by rule or path.
7. Push Protection is a control, not an obstacle: the block was the system working, and bypassing it was never an option.

## Status

**CLOSED — remediated and independently verified, 2026-07-18.**

Credential exposure has been remediated; repository history has been sanitized; security controls have been strengthened (allowlist, policy, pre-commit scanning, standard security documentation); and secret detection is now part of normal repository governance under The Sovereign Academy's operating rhythm. Educational content and simulator behavior are unchanged.
