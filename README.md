# ScanShield AI

ScanShield AI is a full-stack cybersecurity SaaS application for phishing detection, scam prevention, malicious URL review, QR/message/file analysis, and secure report workflows.

## Stack

- Frontend: React, TypeScript, Vite, Vite SPA patterns, Fetch API integration, Lucide icons, responsive CSS with dark mode.
- Backend: Node.js/Express TypeScript API with JWT-style authentication, PBKDF2 password hashing, secure cookies, Helmet headers, CORS, built-in rate limiting, Zod validation, and JSON persistence for local/Supabase migration readiness.

## Features

- Sign up, log in, remember me, forgot/reset password endpoints, profile/preferences, change password, delete account, protected routes, admin role bootstrap for the first user.
- Dashboard with security score, recent scans, favorites, statistics, threat graph, malicious URL count, phishing count, total scans, and last scan date.
- User-owned AI API settings for Gemini, OpenAI, Groq, OpenRouter, and Hugging Face with test, save, change, delete, masking, and no hardcoded keys.
- Scan Center for URL, website, email, email text, screenshot, image, PDF, QR, phone, SMS, WhatsApp, social messages, file metadata, and plain text.
- Results include risk score, threat level, explanation, reasons, confidence, indicators, recommendations, next steps, timing, scan ID, copy, share/print/PDF workflow.
- History APIs include search-ready data, favorite, delete, and export-ready result structures.
- Notifications and admin APIs for users, suspension, deletion, analytics, threat statistics, and system logs.

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Web: `http://localhost:5173`  
API: `http://localhost:4000`

## Deployment notes

- Use Vercel for `apps/web`.
- Use Render for `apps/api`.
- Replace JSON persistence with PostgreSQL/Supabase by implementing the same store contract in `apps/api/src/store/database.ts`.
- Set a strong `JWT_SECRET`, `COOKIE_SECURE=true`, and production `CLIENT_ORIGIN`.
