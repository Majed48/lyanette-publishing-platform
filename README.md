# Lyanette Publishing Platform — Mensajes de Dios al Corazón

Bilingual (ES/EN) static marketing + demo-store site for Lyanette Valiente's
devotional *Mensajes de Dios al Corazón / Messages from God to the Heart*.

## Structure

```
index.html          Language chooser / meta-refresh redirect to /es/
es/  (24 pages)     Spanish edition — full site chrome in Spanish
en/  (24 pages)     English edition — full site chrome in English
assets/css/         styles.css (Warm Ivory · Soft Gold · Cormorant Garamond)
assets/js/site.js   Shared chrome wiring, cart (localStorage), coupons
assets/js/reader.js Sample-chapter reader (5 free chapters, 5 locked previews)
assets/logo/        Wordmark/monogram/favicon (SVG + PNG, light/dark)
assets/images/      Covers, paperback wraps, mockups, social squares
```

Pages per language: home, book, store, cart, checkout, order-confirmation,
download, account, reader, author, blog (+3 posts), devotionals, search, FAQ,
contact, newsletter, prayer-requests, privacy, terms, cookies, 404.

## Current state (audited 2026-08-02)

**Working (verified in browser):**
- All 2,197 internal links/asset references resolve — zero broken links.
- Zero console errors across every page tested.
- Store → cart → coupon (`GRACIA10` −10%, `PAZ20` −20%) → checkout →
  order confirmation → downloads-unlocked → account history: full flow works.
- Sample reader: chapter nav, locked-chapter CTA, dark mode, font size,
  bookmarks, progress, TOC search.
- Client-side site search, newsletter/contact/prayer forms (demo success
  messages), 404 page, ES/EN cross-links on every page.

**Demo-only (client-side, no backend):**
- Cart, checkout, and orders live in `localStorage` — the card fields are
  cosmetic; no payment is processed.
- "Download EPUB/PDF" buttons are stubs (`href="#"` + a local download log);
  no ebook files ship with the site.
- Newsletter/contact/prayer forms have no `action` — nothing is sent anywhere.
- Amazon paperback/Kindle links are `href="#"` placeholders.

## Fixes applied 2026-08-02

1. `site.js` — language now derives from the URL path (`/es/` vs `/en/`).
   Previously a localStorage default forced `<html lang="es">` onto English
   pages at runtime (screen-reader/SEO bug).
2. `site.js` — removed dead `buildHeader`/`buildFooter`/`NAV` code that
   still pointed at a nonexistent `books.html`.
3. Checkout (both languages) now records the coupon used to
   `mdc-last-coupon`, so the account page's "last coupon used" works after
   purchase instead of always showing empty.

## Launch checklist (needs decisions/credentials — not done)

- [ ] Real payments: replace demo checkout (Stripe Payment Links or Checkout).
- [ ] Ebook delivery: host EPUB/PDF files + secure download links
      (order-lookup form on `download.html` also needs a backend).
- [ ] Newsletter: wire footer + newsletter forms to an ESP (GHL/Mailchimp).
- [ ] Contact & prayer-request forms: point at a form backend or GHL.
- [ ] Amazon: replace `href="#"` with real paperback/Kindle listing URLs.
- [ ] Hosting: any static host; add a 404 rule pointing at `es/404.html`
      (custom 404s don't work on bare `python -m http.server`).
- [ ] Root `index.html` is a meta-refresh to `/es/` — consider hreflang tags
      and per-page canonical URLs once the domain is chosen.

## Local preview

```bash
python -m http.server 8791
```

Then open http://localhost:8791/ (redirects to the Spanish home).
