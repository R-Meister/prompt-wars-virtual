# CrowdSense AI — Build Plan & Phased Breakdown

## Build Plan (Phased)

### Phase 0 — Foundation (Day 0-1)
- Initialize mono-repo structure (`web`, `functions`, `shared`)
- Choose stack (React + Vite + Firebase)
- Define environment variable strategy
- Set CI checks for size, tests, and lint

### Phase 1 — Core Data & Backend (Day 1-2)
- Set up Firestore schema for zones, queues, and alerts
- Implement Cloud Functions endpoints with input validation
- Add simulated event ingestion pipeline
- Add minimal Cloud Logging per PRD constraints

### Phase 2 — Intelligence Layer (Day 2-3)
- Implement surge scoring and route recommendation heuristics
- Add optional Vertex AI calls only on significant data changes
- Ensure deterministic fallback when AI is unavailable/quota-limited

### Phase 3 — Real-Time Frontend App (Day 3-5)
- Build dashboard for live crowd heat zones
- Add queue cards, alert rail, and route suggestions
- Use Firestore real-time listeners (no polling)

### Phase 4 — Accessibility + Localization (Day 5)
- Achieve WCAG 2.1 AA compliance targets
- Add ARIA labels and keyboard navigation
- Implement high-contrast tokens
- Add dynamic language switching + translation cache

### Phase 5 — Security Hardening (Day 5-6)
- Implement Firebase Auth role model
- Enforce strict Firestore Security Rules
- Apply least-privilege IAM for service accounts
- Keep secrets out of repo (Secret Manager/env vars)

### Phase 6 — Testing & Performance Gate (Day 6-7)
- Add unit + integration + edge-case tests
- Validate offline/firestore-failure behavior
- Enforce LCP target and repo size budget (`<10MB`)
- Deploy to Firebase Hosting

## Landing Page Plan (Frontend Inspiration Applied)

### Visual Direction
- Bold black outlines with off-white dotted/textured background
- High-energy lime and orange stat blocks
- Asymmetrical grid layout with sticker/badge accents

### Hero Layout
- Left panel: product narrative, short value pitch, dual CTA
- Right panel: stacked metric tiles (`Live Alerts`, `Avg Queue Cut`, `Active Zones`)

### Navigation
- Compact uppercase tabs
- Strong primary CTA block on the right
- Border-separated sections

### Typography
- One expressive headline font + one readable UI font
- Heavy uppercase for labels and metrics
- Maintain deliberate, non-generic visual identity

### Motion & Interaction
- Meaningful entrance animations (staggered cards, CTA lift, metric count-up)
- Avoid excessive micro-animations

### Mobile Behavior
- Preserve identity with stacked card composition
- Simplified nav and touch-friendly CTAs
- Compressed stat panel for small screens

## Detailed Work Breakdown

- Product shell: routing, app layout, theme tokens, reusable UI primitives
- Realtime layer: Firestore subscription hooks, optimistic updates, loading/empty/offline states
- Prediction module: trend features, confidence scoring, AI fallback path
- Ops tooling: simulation speed flags, log verbosity controls, environment guardrails
- Compliance checks: accessibility audit, security rules tests, performance budget checks

## Milestones / Exit Criteria

### M1 (End of Phase 2)
- Simulated event stream updates Firestore reliably
- Surge scores generated consistently

### M2 (End of Phase 3)
- Dashboard renders live zones, queue pressure, and route recommendations in near real-time

### M3 (End of Phase 5)
- Auth, rules, and IAM validated via denied-access tests

### M4 (End of Phase 6)
- Deploy-ready with passing tests and budget/performance compliance

## Risk Controls

- Free-tier overuse: throttle simulation and batch events
- Cold starts: keep functions lightweight with minimal dependencies
- Translation cost spikes: cache by key/locale and pre-translate core UI copy
- UI complexity drift: lock design tokens and reusable component patterns early
