# LaunchPadX Core Frontend Engine

Next.js (App Router) + TypeScript + Cloudflare Pages Worker Integration + Firebase NoSQL Core.

## System Engine Architecture
- **Web App Delivery**: Compiled via `@opennextjs/cloudflare` to run on Cloudflare Pages workers.
- **Data Matrix**: Connected via stateless API endpoints to **Firebase Firestore**.
- **Automated Communication Loops**: Split cron jobs (`video-invite-batch`, `video-outcome-batch`) manage time-locked applicant status changes.

## Deployment Mechanics
Build paths are kept clear using OpenNext configuration overrides. Compilation and publishing are processed with:
```bash
npx opennextjs-cloudflare build
npx wrangler pages deploy .open-next/assets
```

## Security Credentials
The operational workspace requires these environment bindings:
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `CRON_SECRET`
