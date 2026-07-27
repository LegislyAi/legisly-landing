# Landing → App signup handoff + Federal→Local coverage copy

**Branch:** `feat/landing-page-signup-federal-copy`
**Date:** 2026-07-24
**Client asks (Slack, Hadi):**
1. "It still says federal and congress features but we need to replace that with local"
2. "Users need to be able to signup from landing page"
3. "Should we connect Stripe with Landing page?" → **Yes**

---

## 1. Root cause

Both complaints are symptoms of one thing: **the marketing site is frozen in pre-launch
waitlist mode while the product has shipped with Stripe billing.**

The site was authored against a roadmap that no longer holds:

| Site says | Reality |
|---|---|
| "Launching Summer 2026" (7 pages) | It *is* Summer 2026. Product is live. |
| "Join the Founding 20 / First 20 FREE" | Stripe onboarding is built and billing works. |
| Every CTA → `#waitlist` (Formspree) or Calendly | App lives at `d1v7uf95aw2lbq.cloudfront.net` |
| "CA + Federal" coverage | Product covers CA **state + local** |

**There is not a single link from the marketing site to the product app.** Not a signup
link, not even a "Log in" link. A returning paying customer has no way back into the app
from legisly.ai. That is the actual defect behind ask #2 — it is bigger than a missing
button.

### Why it happened
`f99b305` locked the site down to positioning-only, and `f12a050` restored the
*pre-lockdown* content verbatim. The restore brought back June's roadmap copy wholesale,
including the federal positioning and the waitlist funnel, with no reconciliation against
what shipped in the meantime.

---

## 2. Current CTA inventory (what has to change)

Every CTA on the site points at one of three dead ends. Full map:

| File | Line | Current target | Becomes |
|---|---|---|---|
| index.html | 279 | `#waitlist` "Join Waitlist" | nav: `Log in` + `Start free trial` |
| index.html | 290 | `#waitlist` "Claim your spot" | hero: `Start free trial` + demo |
| index.html | 384–389 | Formspree waitlist form | GET form → `/auth/register?email=` |
| features.html | 84 | Calendly "Request Demo" | nav pair |
| features.html | 200 | `index.html#waitlist` | `Start free trial` |
| pricing.html | 93 | `index.html#waitlist` | nav pair |
| pricing.html | 122 | `index.html#waitlist` | `?plan=core` |
| pricing.html | 141 | `index.html#waitlist` | `?plan=intelligence` |
| pricing.html | 184–185 | `index.html#waitlist` ×2 | `?plan=core` / `?plan=intelligence` |
| pricing.html | 196 | `index.html#waitlist` | `Start free trial` |
| how-it-works.html | 97, 171 | `index.html#waitlist` | nav pair + trial |
| about.html | 251, 360 | `index.html#waitlist` | nav pair + trial |
| contact.html | 91, 151 | `index.html#waitlist` | nav pair (keep demo) |
| faq.html | 77 | `index.html#waitlist` | nav pair |
| blog.html | 203 | `index.html#waitlist` | nav pair |
| careers.html | 213 | `index.html#waitlist` | nav pair |
| security.html | 205 | `index.html#waitlist` | nav pair |
| privacy.html | 99 | `index.html#waitlist` | nav pair |
| terms.html | 102 | `index.html#waitlist` | nav pair |
| thank-you.html | 91 | `index.html#waitlist` | nav pair |
| 404.html | 27 | `index.html#request` (**broken anchor**) | nav pair |

`404.html:27` points at `#request`, an anchor that does not exist on index.html — a
latent bug the restore preserved.

---

## 3. Architecture decision — why a shared `site.js`

**Constraint:** no build step, no templating. Nav + footer are hand-duplicated across 14
pages (CLAUDE.md calls this out as a recurring pain).

If the app URL is hardcoded into ~50 anchors across 14 files, then the day this moves
from `d1v7uf95aw2lbq.cloudfront.net` to `app.legisly.ai` — which it will, CloudFront
default domains are never the final answer — someone edits 50 places by hand and misses
some.

**Solution:** one shared `site.js`, loaded by every page, that owns the app origin.

This is not new infrastructure for its own sake. Two scripts are *already* copy-pasted
verbatim into all 14 pages (the IntersectionObserver `.reveal` observer and the nav
toggle). Folding those into the same file removes existing duplication rather than adding
a layer — it mirrors how `styles.css` is already shared.

### Progressive enhancement (non-negotiable)
The HTML ships a **real, working absolute URL** in every `href`. `site.js` only
*decorates* it (origin override + UTM forwarding). If the script 404s or JS is disabled,
every signup link still works. No CTA is ever JS-dependent.

Same for the email handoff: a native `<form method="get" action=".../auth/register">`
with `<input name="email">` produces `/auth/register?email=…` with **zero JavaScript**.
UTMs ride along as hidden inputs. JS is not in the critical path at all.

### Attribution
Per current guidance, traffic that lands on the marketing domain first must **forward**
its inbound `utm_*` into the app, or the signup is attributed to "direct" and the ad
spend is unreadable. `site.js` forwards any inbound `utm_*` and stamps
`utm_source=legisly.ai` / `utm_medium=landing` / `utm_campaign=<page>` when absent.

---

## 4. Implementation

### 4.1 `site.js` (new, ~60 lines)

```
APP_ORIGIN = 'https://d1v7uf95aw2lbq.cloudfront.net'
APP_PATHS  = { register: '/auth/register', login: '/auth/login' }
```

Responsibilities, in order:
1. **Decorate `[data-app]` links** — resolve origin + path, carry `data-plan` → `?plan=`,
   merge UTMs. Idempotent; safe to run twice.
2. **Decorate `[data-app-form]`** — sync hidden UTM inputs before submit.
3. **Nav toggle** — replaces the inline snippet in 14 pages.
4. **Reveal observer** — replaces the inline snippet in 14 pages.

Guarded so a missing element on any given page is a no-op, not a thrown error that kills
the rest of the file.

### 4.2 Nav pattern (all 14 pages)

Follows the Vercel / Linear / Stripe convention — a returning user and a new user need
different doors, and neither should have to hunt:

```
[logo]   Features  How It Works  Pricing  About      Log in   [ Start free trial ]
```

- `Log in` — quiet text link, `--muted`, no box. Existing customers only.
- `Start free trial` — existing `.nav-cta` orange button. Unchanged styling.

**Mobile (< 920px):** the drawer already stacks. `Log in` becomes a full-width row
matching the other nav rows; the trial button keeps its full-width treatment at the
bottom. New CSS is ~6 lines; no change to the existing toggle behaviour.

### 4.3 Homepage `#waitlist` → real signup section

Keeps the section id (`#waitlist` is linked from 13 pages) but the form becomes a GET
handoff to the app with the typed email carried across. User types email once on the
landing page and lands on a register form with it prefilled — one less field, which is
the whole point of the pattern.

> Depends on the app reading `?email=`. If it does not, the link still works, the field
> is just empty. Nothing breaks. See open question Q3.

### 4.4 Pricing → plan preselection

Core → `?plan=core`, Intelligence → `?plan=intelligence`. The visitor makes the plan
decision on the pricing page where the comparison lives, and does not have to make it
again inside the app. Same dependency/fallback note as above.

### 4.5 Federal → Local copy

| File | Lines |
|---|---|
| index.html | 333–335 (sources strip) |
| features.html | 93, 109, 110, 111, 122, 123, 127, 128, 129 |
| faq.html | 94, 96, 103, 120 **and** 160, 176, 184, 224 (JSON-LD) |
| about.html | 269, 318, 321 |
| how-it-works.html | 123, 124, 128 |
| pricing.html | 112, 160 |

**Trap:** `faq.html` carries a `FAQPage` JSON-LD block that duplicates every visible
answer. Editing only the visible copy silently desyncs structured data from the page —
Google flags that. Both copies change together.

---

## 5. Open questions (block copy, not architecture)

**Q1 — Which local sources are actually integrated?**
`index.html:333–335` names real integrations: Congress.gov, Federal Register,
Regulations.gov. Replacing them means naming what the product *actually* ingests for
local (city council / county board agendas — Legistar? PrimeGov? Granicus?). I will not
invent integration names on a marketing page.

**Q2 — Is the pre-launch framing dead?**
"Launching Summer 2026", "Join the Founding 20", "First 20 FREE / 3 months free" appear
across 7 pages. It is now July 2026 and billing is live. "Launching Summer 2026" next to
a "Start free trial" button reads as broken. Retire, or keep the Founding-20 promo as a
promotional frame around a live trial?

**Q3 — Does `/auth/register` read `?plan=` and `?email=`?**
Unknown from outside — CloudFront returns 200 for every path, so the SPA cannot be
introspected. Unknown params are harmless (silently ignored), so this is safe to ship
either way, but the fewer-clicks win needs the app side to read them.

**Q4 — Trial terms / CTA label.**
"Start free trial" vs "Get started" vs "Create account" depends on whether Stripe is
configured with a trial period. Label must match what actually happens after the click.

---

## 6. Verification

- Every page: nav renders trial + login; both resolve to the app.
- JS disabled: every CTA still navigates; email form still GETs to register.
- Mobile 390 / 768 / 1280: drawer, CTA pair, pricing buttons — no overflow.
  (Screenshot at ≥500px — headless Chrome fakes overflow at 390.)
- `grep -i "federal|congress"` returns nothing outside `security.html` legal context.
- JSON-LD in faq.html matches visible answers.
- Keyboard: `Log in` and trial button both reachable, `:focus-visible` ring intact.
