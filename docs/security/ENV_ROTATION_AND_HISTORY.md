# Environment files — security remediation

## Tracked files removed from Git (local copies kept)

| File | Risk if exposed |
|------|-----------------|
| `.env` | May contain `GEOAPIFY_API_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, API URLs |
| `.env.local` | Same keys; often used for developer overrides |
| `.env.production.local` | Production-oriented overrides; highest impact if leaked |
| `.env.development.local` | Local dev secrets |

**Safe to keep tracked:** `.env.example` (placeholders only, no real values).

## Credential rotation (release blocker)

Rotate any secret that was ever committed to the public `website-hub-next` repository:

1. **Geoapify** — create a new API key in the Geoapify dashboard; revoke the old key. Update server and `GEOAPIFY_API_KEY` / `NEXT_PUBLIC_GEOAPIFY_API_KEY` in deployment secrets only.
2. **Google OAuth** — if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` was committed, treat the OAuth client as public by design, but review authorized JavaScript origins and rotate the **backend** `GOOGLE_CLIENT_SECRET` if it was ever in a tracked file (backend repo separate audit).
3. **Razorpay** — rotate **KEY_SECRET** on the Razorpay dashboard if exposed; update `NEXT_PUBLIC_RAZORPAY_KEY_ID` only if the key id was compromised (public key id is less sensitive than secret).

Do **not** paste new secrets into this document or into Git.

## Git history cleanup (required for public repo)

Removing files from the latest commit does **not** remove secrets from history. Before treating the repo as clean:

1. Coordinate with the team — history rewrites affect all clones.
2. Use [GitHub secret scanning](https://docs.github.com/en/code-security/secret-scanning) alerts if enabled.
3. Rewrite history with `git filter-repo` or BFG Repo-Cleaner to drop `.env`, `.env.local`, `.env.production.local`, `.env.development.local` from all commits, then force-push **only after** rotation and team approval.
4. Invalidate any CI caches that embedded old env files.

Example (maintainer-only, after backup):

```bash
# pip install git-filter-repo
git filter-repo --path .env --path .env.local --path .env.production.local --path .env.development.local --invert-paths
```

## Deployment checklist

- Store production values in the host’s secret manager (Vercel Environment Variables, etc.).
- Verify `.env.example` documents every **name** without values.
- Add a CI step that fails if `git ls-files '*.env*'` lists anything other than `.env.example`.
