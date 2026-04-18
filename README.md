# CrowdSense AI

Cloud-native smart stadium experience platform built for zero-cost operation on GCP serverless services.

## Project Structure

- `web/`: React + Vite frontend for landing and dashboard surfaces
- `functions/`: Firebase Cloud Functions backend for ingestion/simulation
- `firestore.rules`: Firestore access control rules
- `firebase.json`: Firebase Hosting, Functions, Firestore, and emulator config

Core realtime collections:

- `zones`: latest zone telemetry, congestion score, and queue estimates
- `alerts`: elevated-risk alerts with localized message payloads
- `recommendations`: deterministic operator action cards per zone
- `translations`: cached translated alert copy by locale

## Local Development

### 1) Frontend

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

### 2) Functions + Firestore emulator

```bash
cd functions
npm install
cp .env.example .env.local
npm run serve
```

The web app reads Firebase config from `web/.env.local` and enables auth/listeners when configured.

## Role Management

Set an initial admin user by calling the `setUserRole` function with your bootstrap secret:

```bash
curl -X POST "http://127.0.0.1:5001/crowdsense-ai-dev/us-central1/setUserRole" \
  -H "content-type: application/json" \
  -H "x-admin-bootstrap-secret: $ADMIN_BOOTSTRAP_SECRET" \
  -d '{"uid":"<firebase-uid>","role":"admin"}'
```

Allowed roles: `viewer`, `admin`.

## Build and Test

```bash
cd web && npm run build
cd web && npm run lint
cd functions && npm test
```

To push sample telemetry into Firestore via the ingestion function:

```bash
cd functions
npm run simulate:push
```

## Deploy

```bash
firebase deploy
```

## Zero-Cost Deployment Guardrails

To avoid any real money usage, keep external paid APIs disabled:

- In `functions/.env.local`, set `ALLOW_EXTERNAL_APIS=false`
- Do not set `GOOGLE_TRANSLATE_API_KEY` (or leave it blank)
- Keep usage on Firebase Spark plan and avoid upgrading billing

You can verify the default safety setting with:

```bash
cd functions
npm run check:zero-cost
```

With this setup, the app runs fully with deterministic fallbacks and cached/local messages only.

## Notes

- Keep secrets out of the repository; use Firebase/GCP secret management.
- Set `GOOGLE_TRANSLATE_API_KEY` in functions env to enable translation caching.
- CI includes Firebase Hosting preview on pull requests.
