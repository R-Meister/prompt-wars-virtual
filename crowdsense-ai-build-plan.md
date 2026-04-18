# CrowdSense AI - Execution Blueprint (Score Maximization)

This document rewrites and extends the original build plan with an implementation-first roadmap focused on maximizing:

- Code Quality
- Security
- Efficiency
- Testing
- Accessibility
- Google Services usage
- Problem Statement Alignment

It preserves the original context (serverless GCP, free-tier constraints, real-time crowd intelligence) while adding concrete delivery sequencing and acceptance criteria.

## 1) Goal and Constraints (Preserved Context)

- Build a cloud-native platform that improves physical event experience for attendees at large-scale sporting venues.
- Core outcomes: better crowd movement, shorter waiting times, and stronger real-time coordination.
- Operate inside GCP/Firebase free-tier-friendly limits and keep repository lightweight.
- Keep zero-trust security posture and WCAG 2.1 AA accessibility compliance.

## 2) Current State Snapshot

Already implemented:

- React + Vite frontend with inspired landing page and dashboard route
- Firebase Hosting/Functions/Firestore/Auth scaffolding
- Live Firestore listeners for zones and alerts
- Simulation ingestion endpoint and simulation push script
- Basic role assignment endpoint and initial Firestore rules
- Basic unit test coverage for simulator utilities

Not yet fully production-ready:

- Vertex AI integration for predictive recommendations
- Google Translate integration with cached localization
- Rules testing matrix and integration/e2e test coverage
- Bundle/performance hardening and CI quality/security gates
- Accessibility audit artifacts and reduced-motion/announcements behavior

## 3) Phased Roadmap (Priority Ordered)

### Phase P0 - Platform Hardening (1-2 days)

Scope:

- Split monolithic frontend into modules: `auth`, `dashboard`, `alerts`, `recommendations`, `shared/ui`
- Add strict lint + format + pre-commit hooks
- Introduce shared schemas for payload validation (runtime validation in functions)
- Add CI checks: lint, unit tests, web build

Exit criteria:

- No lint errors
- Build and tests pass in CI
- Clear folder boundaries and shared contracts documented

### Phase P1 - Security and IAM Hardening (1-2 days)

Scope:

- Enforce stricter Firestore field-level rules for each collection
- Add Firestore rules test suite (allow/deny matrix)
- Lock down `setUserRole` flow (bootstrap + rotation playbook, least privilege)
- Add App Check integration plan for frontend abuse protection
- Add CORS and method restrictions for all HTTP functions

Exit criteria:

- Rules tests pass with explicit deny coverage
- Role elevation path is auditable and documented
- Secrets managed only through env/Secret Manager

### Phase P2 - Core Intelligence and Problem Fit (2-3 days)

Scope:

- Implement queue-time estimator with confidence score
- Implement route recommendation engine (zone graph + congestion-aware rerouting)
- Emit operator actions: reroute, dispatch staff, signage change, multilingual alert trigger
- Add deterministic fallback for all model-driven outputs

Exit criteria:

- Every high-congestion event produces an actionable recommendation
- Queue and movement guidance shown in real time on dashboard
- Fallback logic works without AI dependency

### Phase P3 - Google Services Completion (2 days)

Scope:

- Vertex AI integration for surge/reroute suggestions on significant deltas only
- Google Translate API integration with cache layer (`translations` collection)
- Cloud Logging structured events and severity discipline
- Cloud Monitoring dashboard and budget alert setup checklist

Exit criteria:

- AI call rate throttled and quota-safe
- Localized alert text available for supported languages
- Observability dashboard captures latency, error rate, ingest volume

### Phase P4 - Testing Deepening and Reliability (2 days)

Scope:

- Functions integration tests (ingest -> Firestore writes -> alert generation)
- Frontend tests for auth states, live updates, error/empty/offline states
- End-to-end flow test (sign-in, ingest simulation, dashboard update)
- Surge/load simulation scripts and stability checks

Exit criteria:

- Critical path tests automated and green
- Regression checks cover ingest, role control, and live telemetry rendering

### Phase P5 - Accessibility and UX Refinement (1 day)

Scope:

- WCAG 2.1 AA validation pass (keyboard, focus, contrast, labels)
- Add `aria-live` updates for dynamic alerts
- Reduced motion support and consistent focus ring handling
- Final copy pass for clarity under time pressure and event noise

Exit criteria:

- Accessibility checklist completed and documented
- Live operational screens are keyboard-usable and readable under stress

### Phase P6 - Efficiency and Launch Readiness (1 day)

Scope:

- Route-level code splitting for dashboard/firebase-heavy modules
- Bundle budget checks in CI and warning threshold enforcement
- Write-throttling/de-dup strategy for simulation ingestion
- Deployment checklist and rollback playbook

Exit criteria:

- Web build meets performance budget targets
- Rollback path tested via commit-based recovery
- Deploy preview and production commands documented

## 4) Workstreams by Judging Criteria

### Code Quality

- Modularize frontend and function utilities
- Add style/lint/format gates and commit hooks
- Keep logic side-effect free where possible
- Define data contracts for zones, alerts, profiles, simulation events

### Security

- Tight role-based Firestore rules with explicit deny behavior
- Admin role assignment guardrails and audit logs
- Secret handling via env and deployment secrets only
- Validate and sanitize all function inputs

### Efficiency

- Event-driven listeners only; avoid polling
- AI/Translate calls on meaningful change only
- Cache translations and avoid duplicate requests
- Reduce bundle size via lazy loading and dependency boundaries

### Testing

- Unit: scoring, routing, parser, validators
- Integration: function-to-firestore consistency
- Rules: all collections allow/deny matrices
- E2E: operator flow and attendee-impact scenarios

### Accessibility

- WCAG AA semantics, contrast, keyboard access
- `aria-live` for alert updates and status transitions
- Reduced motion and predictable focus order
- Mobile-first readability for loud/high-distraction environments

### Google Services

- Firebase Hosting (frontend)
- Cloud Functions (ingest, role control, recommendation APIs)
- Firestore (realtime state, alerts, profiles, translation cache)
- Vertex AI (advanced predictions)
- Cloud Logging/Monitoring (observability)
- Google Translate API (multilingual alerts)

### Problem Statement Alignment

- Crowd movement: dynamic rerouting recommendations per zone state
- Waiting times: queue estimation and proactive redirection
- Real-time coordination: live operations board + role-based actions
- Seamless attendee experience: clear advisories, multilingual updates, low-latency UI

## 5) Milestones and Deliverables

- M1: Hardened baseline (quality + security scaffolding complete)
- M2: Realtime dashboard with reliable recommendations and role-aware actions
- M3: Vertex AI + Translate integrated with quota-safe triggers
- M4: Full test matrix + accessibility report + performance gate pass
- M5: Demo-ready production deploy with rollback-safe release notes

## 6) Risks and Mitigations

- Free-tier quota exhaustion -> trigger thresholds, backoff, and batching
- Bundle growth from Firebase SDK -> route splitting and selective imports
- Security drift -> rules tests in CI + denied-case enforcement
- Model dependency volatility -> deterministic fallback recommendations
- Ops confusion during event peaks -> concise action cards and escalation levels

## 7) Immediate Next Sprint (Execution Order)

1. Modular refactor + lint/format hooks + CI quality gates
2. Firestore rules tests + role hardening + CORS/App Check plan
3. Queue estimator + route engine + actionable recommendation cards
4. Vertex AI and Translate integration with caching + throttling
5. Integration/E2E/accessibility/performance audits and fixes

## 8) Definition of Done (Judging-Aligned)

- Code quality gates are automatic and enforced pre-merge
- Security posture verified by rules tests and role control checks
- Efficiency targets met (bundle budget, latency, write discipline)
- Testing includes unit, integration, rules, and e2e critical path
- Accessibility reaches WCAG 2.1 AA with documented evidence
- Google services integrated with practical, cost-aware usage
- Product demonstrably improves crowd movement, waiting times, and coordination
