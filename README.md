# AIGuardian · ScanShield AI

ScanShield AI is a fullstack platform concept for detecting phishing, scam messages, social engineering, malware links, fake invoices, fake banking pages, and dangerous QR codes.

## Tech stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Shared package:** TypeScript types/constants for both apps

## Project structure

```text
apps/
  web/      React website and scan experience
  api/      Express API for health checks and scan analysis
packages/
  shared/   Shared TypeScript types and constants
docs/       Architecture and planning notes
```

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

The web app runs on `http://localhost:5173` and proxies API requests to `http://localhost:4000`.

## Starter API endpoints

- `GET /api/health` returns service health.
- `POST /api/scan` accepts a starter payload like:

```json
{
  "type": "url",
  "url": "http://example-paypal-login.test",
  "content": "Urgent: verify account password"
}
```

## Roadmap

- Upload screenshots and extract text with OCR.
- Paste suspicious emails or SMS messages.
- Scan URLs and detect lookalike domains, redirects, and risky registration patterns.
- Decode QR codes and analyze destinations before users open them.
- Explain every score in simple language so users understand why something is suspicious.
