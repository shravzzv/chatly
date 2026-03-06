# Chatly

Chatly is a real-time 1:1 messaging application with media attachments, AI-assisted message enhancements and usage-based billing.

The project is structured as a **cross-platform monorepo** supporting both web and native clients backed by a shared Supabase infrastructure.

Chatly is designed as a production-grade SaaS example covering authentication, messaging, media uploads, rate limiting, billing, and enforcement — without placeholder flows.

## Features

- **1:1 Text Chat**: Real-time messaging with delivery states.
- **Media Attachments**: Support for images and file sharing.
- **AI Enhancement**: Integrated AI-assisted message refinement.
- **Usage Enforcement**: Daily limits and plan-based feature gating.
- **Real-time Infrastructure**: Powered by Supabase Realtime.
- **Secure Auth**: Email and Google OAuth integration via Supabase Auth.
- **Subscription Billing**: Full Lemon Squeezy integration including a customer billing portal.

## Tech Stack

### Web

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Mobile

- Expo
- React Native
- TypeScript
- Expo Router

### Backend

- Supabase (Postgres, Auth, Realtime, Storage)

### Infrastructure

- Vercel AI SDK
- Lemon Squeezy Billing
- GitHub Actions (CI)

### Testing

- Jest (Unit)
- Playwright (E2E)

## Architecture Overview

Chatly follows a strict separation of concerns to ensure data integrity and security:

- **Client UI**: Utilizes optimistic updates for messaging; maintains a read-only usage state for UI gating.
- **Server Actions**: Acts as the authoritative layer for usage enforcement and billing state resolution.
- **Database**: Postgres serves as the source of truth with atomic usage checks handled via RPCs and cascading deletes for data integrity.
- **Storage**: Media is managed via Supabase Storage with periodic cron jobs for cleanup.

The server remains authoritative for all billing status, usage limits, and enforcement decisions.

## Project Structure

Chatly is organized as a monorepo using npm workspaces.

```plaintext
  chatly
  ├── apps
  │   ├── web        # Next.js web client
  │   └── native     # Expo / React Native mobile client
  ├── package.json   # workspace root
  └── tsconfig.json  # project references
```

Both applications share the same backend infrastructure (Supabase, AI services, and billing system) while maintaining platform-specific UI layers.

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

1. **Run the development servers:**

```bash
npm run dev:web
npm run dev:native
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

## Continuous Integration

Chatly uses GitHub Actions for automated quality checks.

CI runs the following jobs:

- Formatting checks
- Linting
- Unit tests
- End-to-end tests

Checks run independently for the web and native applications to reduce build times.

## Testing overview

The test suite exercises the full stack to ensure user-visible behavior is preserved:

- **Unit Tests**: Focused on component logic and state transitions.
- **Integration Tests**: Focused on how a component integrates different domains together.
- **E2E Tests**: Playwright scripts covering real auth flows, billing states, and usage enforcement.

**Run tests:**

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

_Note: CI stability may depend on the availability of external services (Supabase, Lemon Squeezy)._

## Deployment

The web client is deployed on **Vercel**.

The mobile client is built using **Expo** and can be distributed via Expo or platform-specific app stores.

## Known Limitations

- **1:1 Only**: No current support for group chats.
- **Search**: Message search is not implemented.
- **Offline**: No PWA/offline-first support.
- **Admin Tools**: Limited built-in administrative dashboarding.

## License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).
