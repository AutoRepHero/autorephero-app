# AutoRepHero Review Hub — TODO

## Phase 1 — Core PWA
- [x] Review Hub PWA — customer-facing NFC/QR screen
- [x] Owner Dashboard — PIN-protected, platform management, analytics, QR generator
- [x] Success page — post-review confirmation
- [x] PWA manifest (installable, Add to Home Screen)

## Phase 2 — Marketing Landing Page
- [x] Landing page — autorephero.com marketing site at /landing
- [x] ARH shield logo uploaded and used throughout
- [x] Phone number (509) 818-0787 in header/footer/CTAs
- [x] Lead capture modal (5 fields: Name, Business, Phone, Email, Website) via Formspree
- [x] Formspree wired to chuck@autorephero.com
- [x] Hero: "Get More Reviews Without Asking Twice" + 3 CTAs
- [x] Stats bar (4 industry proof points)
- [x] Review Hub feature section
- [x] How It Works (3 steps)
- [x] Testimonials section (3 placeholder quotes)
- [x] Pricing: Free Trial / RRDS Kit $149 / Core $49/mo / Automation Pro $197/mo
- [x] Citations add-on callout ($59/mo, coming soon)
- [x] FAQ accordion (7 questions)
- [x] Expansion Modules accordion (roadmap, below FAQ)
- [x] Final CTA section + footer
- [x] Mobile hamburger nav (logo + phone always visible)
- [x] "Boots on the Ground" plan name
- [x] Removed "your foot in the door" language

## Phase 3 — Routing & Domain
- [x] app.autorephero.com root → Review Hub (/)
- [x] Landing page at /landing
- [x] Domain connected: app.autorephero.com

## Pending
- [ ] Replace 3 placeholder testimonials with real client quotes
- [ ] Activate Formspree endpoint (verify chuck@autorephero.com at formspree.io)
- [x] Multi-tenant backend — each client gets own slug-based URL (/review/[slug])
- [x] Stripe billing integration — live Stripe payment links for Kit ($149) and Core ($47/mo)
- [ ] SMS/email automation (Twilio + SendGrid)
- [ ] GBP connect
- [ ] Social posting integration
- [ ] Citation builder

## Routing Fix
- [x] Hostname-based routing: autorephero.com → LandingPage, app.autorephero.com → ReviewLanding

## Vercel Deployment (Chuck's Infrastructure)
- [x] Convert Express server to Vercel serverless function (api/trpc.ts)
- [x] Update vercel.json: API routes → serverless, SPA routes → index.html
- [x] Update build scripts for Vercel (no esbuild server bundle needed)
- [x] Push to GitHub AutoRepHero/autorephero-app for auto-deploy
- [ ] Verify all routes work: /signup, /login, /owner, /admin, /review/[slug]

## Database Migration: MySQL → Neon Postgres
- [x] Provision Neon Postgres free tier database
- [x] Migrate Drizzle schema from MySQL to Postgres syntax
- [x] Update db.ts to use @neondatabase/serverless driver
- [x] Update drizzle.config.ts for Postgres
- [x] Run migrations, verify all 5 tables exist (users, businesses, platforms, staff, leads)
- [x] Update tests for Postgres — 20/20 passing
- [ ] Push to GitHub with DATABASE_URL instructions
