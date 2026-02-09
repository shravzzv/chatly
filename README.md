# Chatly

Chatly is a real-time 1:1 messaging application with optional AI-assisted message enhancements and usage-based billing.

It is designed as a complete, production-grade SaaS example covering authentication, messaging, media uploads, rate limiting, billing, and enforcement — without placeholder flows.

## Features

- **1:1 Text Chat**: Real-time messaging with delivery states.
- **Media Attachments**: Support for images and file sharing.
- **AI Enhancement**: Integrated AI-assisted message refinement.
- **Usage Enforcement**: Daily limits and plan-based feature gating.
- **Real-time Infrastructure**: Powered by Supabase Realtime.
- **Secure Auth**: Email and Google OAuth integration via Supabase Auth.
- **Subscription Billing**: Full Lemon Squeezy integration including a customer billing portal.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage)
- **AI:** Vercel AI SDK
- **Billing:** Lemon Squeezy
- **Testing:** Jest (Unit), Playwright (E2E)
- **Deployment:** Vercel

## Architecture Overview

Chatly follows a strict separation of concerns to ensure data integrity and security:

- **Client UI**: Utilizes optimistic updates for messaging; maintains a read-only usage state for UI gating.
- **Server Actions**: Acts as the authoritative layer for usage enforcement and billing state resolution.
- **Database**: Postgres serves as the source of truth with atomic usage checks handled via RPCs and cascading deletes for data integrity.
- **Storage**: Media is managed via Supabase Storage with periodic cron jobs for cleanup.

The server remains authoritative for all billing status, usage limits, and enforcement decisions.

## Local Development

### Prerequisites

- Node.js (LTS)
- Supabase Project
- Lemon Squeezy Store (optional for local testing)

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Run the development server:**

```bash
npm run dev
```

### Environment Variables

The following environment variables are required in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=

NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

AI_GATEWAY_API_KEY=
```

_Note: Billing-related features require a valid Lemon Squeezy configuration._

## Billing & Usage Enforcement

Chatly employs a server-side daily usage window strategy:

- **Rate Limiting**: AI enhancements and media uploads are throttled based on the active plan.
- **Atomic Enforcement**: Usage is tracked and enforced via Postgres RPCs to prevent race conditions.
- **Logic Rules**: Failed AI requests count toward usage (token consumption), while failed media uploads do not.
- **UX**: Enterprise plans are never shown upgrade CTAs, even when limits are reached.

## Testing

The test suite exercises the full stack to ensure user-visible behavior is preserved:

- **Unit Tests**: Focused on component logic and state transitions.
- **E2E Tests**: Playwright scripts covering real auth flows, billing states, and usage enforcement.

**Run tests:**

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

_Note: CI stability may depend on the availability of external services (Supabase, Lemon Squeezy)._

## Known Limitations

- **1:1 Only**: No current support for group chats.
- **Search**: Message search is not implemented.
- **Offline**: No PWA/offline-first support.
- **Admin Tools**: Limited built-in administrative dashboarding.

## Project Status

**Status: Closed / Feature Complete**

Chatly is considered feature-complete and is not under active development. The repository may receive dependency updates, security patches, or infrastructure fixes, but no major features are planned.

## License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).
