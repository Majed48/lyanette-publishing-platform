# Deployment

Two supported static hosts. Netlify is the live preview host; Amplify config
is prepared but **no Amplify app has been created** (deliberately — see
repo constraints).

## Netlify (active)

- All behavior is in [`netlify.toml`](../netlify.toml): root `/` → `/es/`
  redirect (302), per-language custom 404s, cache headers, security headers
  (CSP allows only self + Google Fonts). Netlify never serves directory
  listings.
- Deploys: connected to GitHub `main` (or `netlify deploy --prod --dir .`
  for a manual push from a workstation).
- The original drag-and-drop preview at
  https://resilient-cajeta-277c7f.netlify.app is kept as-is and is NOT
  managed from this repo.

## AWS Amplify Hosting (prepared, not created)

1. Amplify Console → New app → Host web app → connect the GitHub repo,
   branch `main`.
2. Build settings are read from [`amplify.yml`](../amplify.yml) (no build
   step; publishes the repo root).
3. Custom headers are read from [`customHttp.yml`](../customHttp.yml)
   automatically.
4. Redirects/404s cannot live in a repo file: paste the contents of
   [`amplify-redirects.json`](amplify-redirects.json) into
   App settings → Rewrites and redirects → Open text editor.

## Cache strategy note

CSS/JS files are not content-hashed, so they get only a 1-hour cache
(`stale-while-revalidate`). If assets are ever fingerprinted (e.g.
`styles.a1b2c3.css`), raise to `max-age=31536000, immutable`.
