# Sovereignty Learning Path

The homepage "Your Path to Sovereignty" section now mirrors the curated journey from the Learn Bitcoin by Doing platform. The data lives in `src/data/sovereigntyPath.ts` and is served by the `/api/sovereignty/path` endpoint.

Each phase references the deployed classroom URLs at
`https://learn-bitcoin-by-doing-afqekjskn-layer-ds-projects.vercel.app/module/<module-id>`
so learners can jump directly into the existing interactive lessons without duplicating content.

| Phase | Modules |
| --- | --- |
| Foundation & Motivation | Understanding Money · Bitcoin Basics · Why Bitcoin Matters Today · Bitcoin Myths & Facts |
| Practical Skills First | Self-Custody & Security · Bitcoin Tools & Practice · Bitcoin Transactions · Private Keys & Addresses |
| Technical Deep Dive | Number Systems & Data · Cryptographic Hashing · Bitcoin Mining · Bitcoin Scripts |
| Advanced Mastery | Merkle Trees · Lightning Network · Advanced Bitcoin Topics |

If the Learn Bitcoin by Doing deployment URL changes, update the `BASE_URL` constant inside
`src/data/sovereigntyPath.ts`.
