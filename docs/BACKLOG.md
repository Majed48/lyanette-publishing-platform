# Implementation Backlog — Lyanette Publishing Platform

Companion to [ARCHITECTURE.md](ARCHITECTURE.md). Phases are ordered so each
one ships user-visible value and nothing depends on a later phase.
**Nothing below activates live payments, creates production AWS resources,
or exposes ebook files without an explicit owner go-ahead.**

---

## Phase 1 — Forms go real (1–2 days)

Newsletter, contact, prayer-request endpoints + static pages pointed at them.

- [ ] SAM/Pulumi stack `lyanette-dev`: HTTP API + 3 Lambdas + DynamoDB table
- [ ] SES domain identity + double-opt-in newsletter flow
- [ ] Honeypot field + per-IP rate limit on all form endpoints
- [ ] Update the 3 demo form handlers in the static pages (keep the same
      success-message UI)

**Security:** prayer requests marked private at write time; no read API for
them at all in this phase. CORS = the two site origins only.
**Cost:** ≈ $0 (all free tier at this volume). SES sandbox is fine until
domain verified.

## Phase 2 — Stripe test-mode checkout + server-side orders (2–4 days)

- [ ] Server-side product catalog (3 SKUs) + Stripe Products/Prices (test mode)
- [ ] `POST /checkout/session` + Stripe-hosted Checkout redirect
- [ ] GRACIA10 / PAZ20 as Stripe Promotion Codes
- [ ] `POST /webhooks/stripe` (signature-verified) → DynamoDB order + entitlements
- [ ] Confirmation page reads `?sid=` → `GET /orders/by-session` (public,
      single-use token) so totals come from the server
- [ ] SES receipt email
- [ ] Replace demo card form with the Stripe button (both languages)

**Security:** prices/discounts server-side only; webhook idempotency keys;
no card data ever touches the site. **Cost:** $0 in test mode.

## Phase 3 — Private book storage + signed downloads (1–2 days)

- [ ] `lyanette-books-dev` S3 bucket: BlockPublicAccess, SSE, versioning,
      access logging — **owner uploads the EPUB/PDF files manually**
- [ ] `GET /downloads/{sku}/{format}`: entitlement check → 15-min presigned URL
- [ ] Order-lookup flow on download.html (email + order id → emailed link),
      rate-limited
- [ ] Download log written server-side (feeds existing UI)

**Security:** download Lambda is the only principal with s3:GetObject;
soft per-order download cap; CloudWatch alarm on anomalous volume.
**Cost:** < $1/mo.

## Phase 4 — Passwordless accounts + customer library (3–5 days)

- [ ] Cognito user pool, email-OTP custom auth flow
- [ ] `GET /orders`, `GET /library` (authed); first login claims guest orders
- [ ] account.html + download.html switch from localStorage to API (with
      localStorage fallback for guests)
- [ ] Data-deletion runbook (single-partition delete)

**Security:** rate-limit OTP issuance; short-lived JWTs + refresh rotation.
**Cost:** $0 (< 50k MAU).

## Phase 5 — Reader sync + gated full-book reading (2–3 days)

- [ ] `PUT/GET /reader/state` (progress, bookmarks, prefs)
- [ ] Entitlement-gated `GET /reader/chapters/{edition}` serving full-book
      JSON to purchasers ("Leer en el navegador" for the whole book)
- [ ] Guest state import at first login

**Security:** chapter API requires auth + entitlement; responses
no-store so full text isn't CDN-cached. **Cost:** ≈ $0.

## Phase 6 — Content pipeline & bilingual CMS (optional, 3–5 days)

- [ ] `content/{es,en}/` markdown + build script rendering blog/devotionals
      into the existing templates (design untouched)
- [ ] Netlify build runs the script (site stays static)
- [ ] Optional: Decap CMS admin at `/admin` (git-gated, free)

**Security:** CMS auth via GitHub OAuth, repo-scoped. **Cost:** $0.

## Phase 7 — Launch hardening (before any live-mode flip)

- [ ] Promote stack to `prod` env, separate Stripe live keys in SSM
      (owner action to provide keys)
- [ ] SES production access + DMARC/SPF/DKIM on the sending domain
- [ ] WAF managed rules on the API
- [ ] Real Amazon paperback/Kindle URLs replace `href="#"` placeholders
- [ ] hreflang + canonical tags, sitemap.xml, robots.txt
- [ ] CSP tightening: move inline scripts to files, drop 'unsafe-inline'
- [ ] Uptime + error alerting (CloudWatch → email)
- [ ] Backup: DynamoDB PITR on; books bucket versioned

**Owner decisions required before this phase:** live Stripe keys, sending
domain, refund policy final text, Amazon listing URLs.

---

## Standing constraints (do not violate in any phase)

1. No redesign of the approved frontend; backend slots in behind it.
2. ES/EN parity for every feature.
3. Ebook files never in the repo, never publicly readable.
4. Stripe stays in test mode until the owner flips it.
5. The original preview site (resilient-cajeta-277c7f) is left untouched.
