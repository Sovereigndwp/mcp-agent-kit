# Security Policy

## Reporting a Vulnerability

Please report suspected vulnerabilities privately — do not open a public issue for anything security-sensitive.

- **Preferred:** GitHub → *Security* tab → *Report a vulnerability* (private vulnerability reporting)
- **Email:** dalia@thesovereign.academy with subject line `SECURITY: mcp-agent-kit`

Include what you found, where (file/commit/URL), and how to reproduce it. You will receive an acknowledgment within 7 days.

## Supported Versions

This is an educational project, not a versioned product. Only the current state of the default branch (`main`) is supported; historical commits, tags, and archived branches receive no fixes.

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| Anything else | ❌ |

## Response Process

1. **Acknowledge** the report (within 7 days).
2. **Assess** severity and scope; reproduce the issue.
3. **Contain** — if credentials are involved, revoke them immediately (see below), before any other action.
4. **Fix** on `main`; rewrite history only when secret material is involved, following the documented procedure.
5. **Verify** from a fresh clone with a full-history secret scan.
6. **Record** the incident in `docs/security/` and credit the reporter if they wish.

## Credential Exposure Policy

If a credential ever appears in this repository's history, working tree, or an open PR:

1. **Revoke first, rewrite second.** The credential is treated as compromised from the moment of discovery, regardless of whether it was published or still valid.
2. Preserve untracked and in-progress work before any history operation.
3. Rewrite history from a **mirror clone** (`git filter-repo`), never from a working repository; then `git reflog expire` + `git gc`.
4. Verify with a **fresh clone** and a full-history scan (`gitleaks git .`).
5. GitHub Push Protection is never bypassed. A blocked push is a stop-and-investigate event.
6. Write an incident record in `docs/security/` — the repository's history is institutional history.

Precedent and template: [`docs/security/2026-07-18-credential-remediation.md`](docs/security/2026-07-18-credential-remediation.md).

## A Note on the Fake Keys

This repository intentionally contains **simulated Bitcoin key material** for teaching (e.g. the published *Mastering Bitcoin* example private key). These values are deterministic, fake, never fund-bearing, and narrowly allowlisted for secret scanning in `.gitleaks.toml`. They are not vulnerabilities; reports about them will be answered with a pointer to `docs/security/SECRETS_POLICY.md`.
