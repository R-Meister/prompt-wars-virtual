# Product Requirements Document - CrowdSense AI (Refined v2)

**Project:** Smart Stadium Experience Platform  
**Author:** Raman  
**Version:** 2.0 (Execution-aligned rewrite)  
**Status:** Active Build Context  
**Target:** Maximum alignment with judging criteria and real-world event operations

---

## 1) Objective

Design and deploy a cloud-native, serverless platform on Google Cloud that improves the physical event experience for attendees at large-scale sporting venues.

The system must directly improve:

- Crowd movement
- Waiting times
- Real-time coordination between organizers and attendees

while preserving:

- Free-tier-friendly operation
- Strong security posture
- High accessibility
- Fast, reliable user experience

---

## 2) Problem Statement and User Impact

Large venues face a live visibility gap:

- Attendees do not know which gates/routes are congested.
- Vendor queues become unpredictable and reduce satisfaction/revenue.
- Operations teams often react late due to fragmented signals.

CrowdSense AI addresses this by converting live telemetry into actionable guidance:

- **For attendees:** where to move next, what to avoid, and when conditions change.
- **For operators:** where to reroute, when to dispatch support, and which alert to send.

Expected impact:

- Reduced hotspot pressure and safer movement
- Lower queue times through proactive redistribution
- Faster, localized communication during dynamic conditions

---

## 3) Scope

### In Scope

- Real-time zone congestion tracking
- Queue estimation and alert generation
- Role-based operations dashboard
- Multilingual notification support
- Predictive recommendation engine with deterministic fallback

### Out of Scope (for this version)

- Native mobile apps
- Hardware sensor procurement/integration at venue edge
- Ticketing/payment integrations

---

## 4) System Architecture and Google Services

The architecture remains serverless and event-driven for efficiency and cost control.

| Google Service | Purpose | Usage Strategy |
| :--- | :--- | :--- |
| Firebase Hosting | Frontend delivery | CDN-backed static deploy, SPA rewrites |
| Cloud Functions | Backend APIs and event handling | Short-lived handlers, strict validation, minimal deps |
| Cloud Firestore | Realtime data store | Listener-driven UI, indexed queries, role-secured docs |
| Firebase Auth | Identity and role-aware access | JWT with custom claims (`viewer`, `admin`) |
| Vertex AI | Predictive enhancement | Trigger only on significant deltas, fallback always available |
| Cloud Logging | Structured observability | Minimal event logs with severity discipline |
| Cloud Monitoring | Reliability tracking | Latency/error dashboards and alert thresholds |
| Google Translate API | Localization | Cached translation entries to control repeated cost |

---

## 5) Functional Requirements

### FR-1: Ingestion and Validation

- Backend must accept simulation/live event payloads (`zoneId`, `density`, `queueMinutes`, `footfall`).
- Invalid input must be rejected with explicit error responses.

### FR-2: Zone State and Alerts

- System must compute congestion score and alert level (`green`, `amber`, `red`).
- `zones` collection must reflect latest known state per zone.
- `alerts` entries must be generated for elevated risk states.

### FR-3: Recommendation Layer

- Dashboard must show recommendation for next best action.
- Recommendation must exist even if AI provider is unavailable.

### FR-4: Realtime Dashboard

- Authenticated users see live zone states and alerts with Firestore listeners.
- Dashboard must surface queue and movement-oriented decisions.

### FR-5: Role Management and Access

- `viewer` and `admin` roles enforced by claims and Firestore rules.
- Admin-only operations (role changes, privileged writes) must be protected and audited.

### FR-6: Localization

- Alerts and core UI strings should support language switching.
- Translation results should be cached to avoid repeated API calls.

### FR-7: Simulation and Demo Operations

- Scriptable simulation pipeline should generate realistic test data and ingest it end-to-end.

---

## 6) Non-Functional Requirements

### Performance and Efficiency

- Frontend should target low initial load and responsive updates.
- Functions should keep low cold-start overhead through lightweight runtime choices.
- Expensive external calls (AI/Translate) must be quota-aware and threshold-triggered.

### Reliability

- Realtime updates must degrade gracefully on transient failures.
- Fallback recommendation path must maintain continuity without AI.

### Security

- Principle of least privilege across service identities and data access.
- No secrets in repository.
- Field-level validation and restricted writes in rules.

### Accessibility

- WCAG 2.1 AA baseline.
- Keyboard operability, clear focus indicators, contrast compliance.
- Dynamic updates announced via assistive-compatible patterns.

---

## 7) Data Model (Logical)

- `zones/{zoneId}`: current congestion, queue time, score, alert, timestamp
- `simulationEvents/{eventId}`: ingested raw simulation payload + timestamp
- `alerts/{alertId}`: alert level, message, zone, createdAt
- `profiles/{uid}`: user identity metadata, role, role update timestamps
- `translations/{key_locale}`: translated text cache for repeated use

---

## 8) Security Model

- Authentication: Firebase Auth (Google sign-in for operator users)
- Authorization: custom claims + Firestore rules (`viewer`/`admin`)
- Admin controls: secured endpoint for role assignment with guarded bootstrap secret
- Data protection: deny-by-default, collection-specific rules, immutable constraints where needed
- Secrets: environment/secret manager only

---

## 9) Testing Strategy

The test strategy follows progressive confidence:

- **Unit tests:** scoring, simulation generation, validators, recommendation helpers
- **Integration tests:** function write paths (`ingest -> zones/alerts/events`)
- **Security rules tests:** allow/deny matrix by role and document shape
- **Frontend tests:** auth states, empty/offline states, realtime update rendering
- **E2E tests:** sign-in, simulate ingest, observe live dashboard outcomes

Target outcome: critical paths are automatically verified pre-merge.

---

## 10) Observability and Operations

- Structured logs for ingestion, role updates, recommendation lifecycle
- Monitoring dashboard for p95 latency, error rates, and event volume
- Budget and quota checks to avoid free-tier overrun
- Release process with incremental commits and rollback-safe history

---

## 11) Success Metrics

### Product Outcome Metrics

- Reduction in peak congestion score over simulated event windows
- Reduction in queue-time hotspots after recommendation actions
- Faster time-to-coordination from risk detection to alert publication

### Technical Metrics

- Stable realtime updates under simulation load
- Low error rate in ingest and role-control endpoints
- Build/test/rules checks passing in CI

### Experience Metrics

- Clear, accessible operational UI usable under time pressure
- Multilingual alert delivery readiness

---

## 12) Constraints and Cost Discipline

- Favor always-free serverless services and conservative API usage
- Trigger AI/Translate only on meaningful changes
- Keep repository and assets lean
- Avoid unnecessary background loops; use event-driven updates

---

## 13) Delivery Plan Reference

Execution details are tracked in:

- `crowdsense-ai-build-plan.md`

This PRD defines requirements and success criteria; the build plan defines implementation sequence and milestones.

---

## 14) Key Differentiator

CrowdSense AI demonstrates that high-quality, accessible, and secure event-operations intelligence can be delivered with serverless architecture and cost-aware engineering, while directly improving attendee movement, queue experience, and on-ground coordination.
