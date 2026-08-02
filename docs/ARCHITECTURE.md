# Production Architecture — Lyanette Publishing Platform

Status: **design document** (2026-08-02). Nothing here is provisioned yet.
The live site is the static frontend in this repo; every commerce feature is
currently a client-side demo. This document defines the target production
system that replaces those demos without redesigning the approved frontend.

## Guiding constraints

- Keep the approved static site as the frontend. The backend is added
  *behind* it (an API the existing pages call), not a rewrite.
- Bilingual parity is a hard requirement: every feature works identically
  under `/es/` and `/en/`.
- Books are paid digital goods → ebook files must never live in the public
  web root or the git repo.
- Start in **Stripe test mode** and stay there until the owner explicitly
  flips to live keys.
- Prefer serverless (Lambda) to keep idle cost ≈ $0 at launch scale.

## Recommended stack

| Concern | Choice | Why |
|---|---|---|
| Static hosting | Netlify (current) or Amplify Hosting | already configured in repo |
| API | AWS API Gateway (HTTP API) + Lambda (Node 20) | pay-per-request, no idle cost |
| Auth | Amazon Cognito user pool (email + code, no passwords required) | managed, cheap, matches "no passwords" copy on account page |
| Database | DynamoDB (single table) | orders/library/progress are simple key-value patterns |
| Payments | Stripe Checkout (hosted page) — test mode | least PCI surface; card fields never touch our site |
| Book files | Private S3 bucket (SSE-S3, versioned, `BlockPublicAccess=ON`) | never publicly readable |
| Downloads | CloudFront signed URLs (or S3 presigned, 15-min TTL) | per-customer, expiring links |
| Email | SES (receipts, magic links) | cheap, same AWS account |
| Forms | API endpoints → DynamoDB + SES notification | replaces demo forms |
| IaC | Pulumi or SAM, one stack per env (`dev`, `prod`) | same pattern as ReguGuard/Velora projects |

## Components

### 1. Authentication (passwordless)

The approved copy says "No usamos contraseñas" — keep that promise:
Cognito user pool with **email OTP (magic code)** custom auth flow.

- `POST /auth/start` → Cognito initiates custom auth, SES emails a 6-digit code.
- `POST /auth/verify` → returns JWT (ID/access/refresh).
- The static pages store the JWT in memory + `localStorage`, and
  `site.js` gains a tiny `authFetch()` helper.
- Guest checkout stays supported: a purchase creates/links an account
  keyed by the buyer's email; the first login claims the order history.

Security notes: rate-limit `auth/start` (WAF + Lambda throttle) to prevent
email bombing; codes expire in 10 min, single use.

### 2. Server-side orders + Stripe (test mode)

- `POST /checkout/session` (public): body = cart line items (SKU ids only —
  **prices come from a server-side catalog**, never from the client),
  optional coupon code. Creates a Stripe Checkout Session
  (`mode=payment`, currency USD, `customer_email` if known,
  `success_url=/{lang}/order-confirmation.html?sid={CHECKOUT_SESSION_ID}`).
- Coupons become **Stripe Promotion Codes** (GRACIA10, PAZ20) so discount
  math is server-side.
- `POST /webhooks/stripe`: verifies signature, on
  `checkout.session.completed` writes the order to DynamoDB
  (`ORDER#<id>`), grants library entitlements (`USER#<email>` →
  `ENTITLEMENT#<sku>`), and sends the SES receipt with a download link.
- `GET /orders` (authed) powers account.html; `GET /orders/lookup`
  (email + order id + rate limit) powers the download.html lookup form.
- SKUs: `es-digital`, `en-digital`, `bilingual-bundle` (+ future).

Client change is minimal: the checkout page's demo card form is replaced by
a single "Pagar con Stripe / Pay with Stripe" button that redirects to
Stripe Checkout. The rest of the approved page stays.

### 3. Customer library + signed downloads

- Private S3 bucket `lyanette-books-<env>`: `books/es/mdc.epub`,
  `books/es/mdc.pdf`, `books/en/…`, `books/bundle/…`. Public access
  blocked at the bucket **and** account level; objects also carry
  `Content-Disposition: attachment`.
- `GET /library` (authed) → entitlements + metadata (title, formats, cover).
- `GET /downloads/{sku}/{format}` (authed or order-lookup token) →
  verifies entitlement in DynamoDB → returns a **15-minute signed URL**;
  logs `DOWNLOAD#` item (device, ts) — this feeds the existing
  "download history" UI on download.html.
- Abuse control: soft cap (e.g. 25 downloads/order/month) with a friendly
  error, monitored via CloudWatch metric.

### 4. Reader progress & bookmarks

Today reader.js keeps bookmarks in `localStorage`. Production adds sync:

- `PUT /reader/state` (authed, debounced): `{edition, chapter, fontStep, dark, bookmarks[]}`.
- `GET /reader/state` on reader load when signed in; localStorage remains
  the offline/guest fallback (merge: server wins on conflict, guest state
  is imported at first login).
- Purchased users may later get full-book chapters via
  `GET /reader/chapters/{edition}` (entitlement-gated JSON, same locked
  preview behavior for guests) — enables "Leer en el navegador" for the
  full book without shipping the EPUB to the browser.

### 5. Newsletter / contact / prayer-request forms

- `POST /forms/newsletter` → upsert `SUBSCRIBER#<email>` + SES
  double-opt-in confirmation (GDPR/CAN-SPAM safe). Later can bridge to
  GoHighLevel/Mailchimp if the owner prefers an ESP UI.
- `POST /forms/contact` and `POST /forms/prayer` → DynamoDB
  (`MESSAGE#<uuid>`) + SES notification to info@egeniehub.com (or the
  author's address). Prayer requests flagged `private: true` — never
  exposed by any API; they are pastoral data, treat as sensitive.
- Spam controls: honeypot field (already easy to add to the static forms),
  per-IP rate limit, optional Turnstile if abuse appears.

### 6. Bilingual content management

Keep the static-site model (it is fast, cheap, and already approved) and
make content editable without hand-editing 49 pages:

- Phase A (no CMS): content lives in git; a small build script
  (`scripts/build-content.mjs`) renders blog posts/devotionals from
  `content/{es,en}/*.md` into the existing page templates. PR-based
  editing; Netlify builds on push.
- Phase B (optional CMS): Decap CMS (git-based, free) or Sanity if a
  WYSIWYG is required. Both write to the same `content/` tree, so
  Phase A work is not thrown away. Every content type carries `es` + `en`
  fields side-by-side to enforce parity.

### 7. DynamoDB single-table sketch

| PK | SK | Item |
|---|---|---|
| `USER#<email>` | `PROFILE` | name, cognito sub, created |
| `USER#<email>` | `ENTITLEMENT#<sku>` | granted_at, order id |
| `USER#<email>` | `READER#<edition>` | chapter, prefs, bookmarks |
| `ORDER#<id>` | `META` | items, totals, stripe ids, email (GSI1: by email) |
| `ORDER#<id>` | `DOWNLOAD#<ts>` | sku, format, ip hash |
| `SUBSCRIBER#<email>` | `META` | status (pending/confirmed), lang |
| `MESSAGE#<uuid>` | `META` | type (contact/prayer), body, lang, private |

### 8. Security baseline

- No secrets in the repo — Lambda env vars via SSM Parameter Store
  (SecureString); Stripe webhook secret rotated on env promotion.
- IAM: one role per Lambda, least privilege (the download Lambda is the
  only reader of the books bucket).
- CloudTrail + S3 access logging on the books bucket from day one
  (lesson learned from the ReguGuard incident: verify auth on every
  endpoint before anything goes live — no "temporary" open APIs).
- WAF rate limiting on `/auth/*`, `/forms/*`, `/orders/lookup`.
- CORS locked to the production origins only.
- PII inventory: emails, names, prayer texts. No card data ever
  (Stripe-hosted checkout). Data deletion path: delete `USER#` partition.

### 9. Cost estimate (launch scale, ~1–2k visits/mo, <100 orders/mo)

| Item | Monthly |
|---|---|
| Netlify free tier (current preview) | $0 |
| Lambda + API Gateway (HTTP API) | < $1 |
| DynamoDB on-demand | < $1 |
| Cognito (< 50k MAU free) | $0 |
| S3 + CloudFront (books are ~5–10 MB) | < $1 |
| SES (sandbox → production, ~500 emails) | < $1 |
| Stripe test mode | $0 (live: 2.9% + 30¢/charge) |
| **Total** | **≈ $2–4/mo** until traffic grows |
