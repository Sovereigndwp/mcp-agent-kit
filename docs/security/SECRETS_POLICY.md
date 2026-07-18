# Secrets Policy — mcp-agent-kit

**Effective: 2026-07-18** · Established as part of the credential remediation recorded in [`2026-07-18-credential-remediation.md`](./2026-07-18-credential-remediation.md).

This is an educational Bitcoin repository. It deliberately contains *fake* key material for teaching, which makes the line between "real secret" and "teaching artifact" a policy matter rather than a judgment call. This document draws that line.

## Never commit

The following must never appear in any commit, branch, tag, or file in this repository — including "temporary" commits on local branches (that is exactly how the 2026-07-18 incident happened):

- API tokens of any provider
- OAuth tokens and refresh tokens
- Client secrets (including Canva client ID/secret pairs)
- Notion integration tokens
- Canva credentials of any kind
- `.env` files containing real values (templates with placeholders are fine — see below)
- Production private keys — Bitcoin, TLS, SSH, PGP, or any other kind
- Passwords, passphrases, database connection strings with credentials, webhook signing secrets

If you are unsure whether something is a secret, treat it as one.

## Allowed

- **Educational deterministic examples** — e.g. the *Mastering Bitcoin* example private key used by the key simulator
- **Mock values** — visibly fake patterns such as `1234567890ABCDEF…`
- **Documentation placeholders** — `your_canva_api_token_here`, `<YOUR_TOKEN>`, `xxx…`
- **Simulated Bitcoin keys** — deterministic constants used by teaching interactives

…provided **all** of the following hold:

1. They are clearly identified as simulations or placeholders in the surrounding code or document.
2. They are deterministic or visibly fake — never generated from real entropy, never derived from a real wallet.
3. They are never used for real funds or real authentication, anywhere, ever.
4. If a scanner flags them, they are allowlisted **by exact value** in `.gitleaks.toml` and recorded as an accepted exception in a security record — never by disabling a rule or exempting a path.

## Scanning and enforcement

- **`.gitleaks.toml`** keeps every default gitleaks rule active; only the documented simulator constants are suppressed, by value.
- **Pre-commit hook** — install once per clone:

  ```bash
  # macOS
  brew install pre-commit gitleaks
  # (or: pipx install pre-commit)

  # from the repository root
  pre-commit install
  ```

  The hook (`.pre-commit-config.yaml`) runs gitleaks against staged changes on every commit.

- **Manual scan** any time:

  ```bash
  gitleaks git .    # full history        (>= 8.19; older: gitleaks detect --source .)
  gitleaks dir .    # current worktree    (older: gitleaks detect --source . --no-git)
  ```

- **GitHub Push Protection** remains enabled on this repository and is never bypassed. A blocked push means stop, investigate, and revoke if needed — not "allow secret".

## If a secret is committed anyway

Follow the credential-exposure policy in [`SECURITY.md`](../../SECURITY.md): **revoke first, rewrite second**, preserve work before history operations, rewrite from a mirror clone, verify with a fresh clone, and write an incident record in `docs/security/`. The 2026-07-18 record is the template.
