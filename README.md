# CrowdSense AI

Cloud-native smart stadium experience platform built for zero-cost operation on GCP serverless services.

## Project Structure

- `web/`: React + Vite frontend for landing and dashboard surfaces
- `functions/`: Firebase Cloud Functions backend for ingestion/simulation
- `firestore.rules`: Firestore access control rules
- `firebase.json`: Firebase Hosting, Functions, Firestore, and emulator config

## Local Development

### 1) Frontend

```bash
cd web
npm install
npm run dev
```

### 2) Functions + Firestore emulator

```bash
cd functions
npm install
npm run serve
```

## Build and Test

```bash
cd web && npm run build
cd functions && npm test
```

## Deploy

```bash
firebase deploy
```

## Notes

- Keep secrets out of the repository; use Firebase/GCP secret management.
- CI includes Firebase Hosting preview on pull requests.
