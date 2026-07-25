# ScanShield AI Architecture

ScanShield AI is organized as a monorepo so the frontend, backend, and shared types can evolve together.

## Apps

- `apps/web`: React + Vite client for upload, paste, URL, and QR scan flows.
- `apps/api`: Node.js + Express API. Express is a good first backend choice because it is fast to scaffold, easy to host, and has mature middleware for uploads, validation, security headers, and AI integrations.

## Packages

- `packages/shared`: Shared TypeScript constants and types used by the web and API apps.

## Suggested next milestones

1. Build the scan form UI for screenshots, text, URLs, and QR images.
2. Add file uploads with size/type validation.
3. Replace the starter rule-based analyzer with AI plus domain reputation and URL metadata services.
4. Add authentication, scan history, and user-safe reporting.
5. Add tests for risk scoring, request validation, and frontend scan states.
