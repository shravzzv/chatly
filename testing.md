# Testing Strategy

This project follows a **purpose-driven testing strategy**.
The goal is **confidence**, not coverage.

Only the most **foundational and high-impact behaviors** are deliberately tested, avoiding redundant or low-signal tests. Coverage percentages are not treated as a success metric.

## Testing Layers

**Three distinct layers of testing** are used, each with a clearly defined responsibility.

## 1. Unit Tests (Jest)

**Tools:** Jest + React Testing Library

**Location:** `__tests__/unit/`

**File suffix:** `.test.ts` / `.test.tsx`

### Purpose

Unit tests verify **isolated logic and behavior**:

- Components (rendering, events, state)
- Hooks
- Utility functions
- Server actions (mocking side effects)

They answer questions like:

- _Does this component call the right action?_
- _Does this helper return the correct value?_
- _Does this action handle errors correctly?_

### Characteristics

- Fast
- Heavily mocked
- No network calls
- No real auth, DB, or browser

### Structure

Unit tests mirror the project structure.

```txt
__tests__/
└─ unit/
   ├─ components/
   │  ├─ account-danger-zone.test.tsx
   │  └─ paid-plan-card.test.tsx
   ├─ lib/
   │  └─ billing.test.ts
```

## 2. Integration Tests (Jest)

**Tools:** Jest + Testing Library

**Location:** `__tests__/integration/`

**File suffix:** `.test.tsx`

### Purpose

Integration tests verify **how multiple parts work together**.

They answer questions like:

- _When the user confirms deletion, does the app redirect?_
- _Does this component correctly hand off control to an action and navigation?_

These tests intentionally avoid:

- Browser automation
- Full network calls
- External providers (e.g. Stripe / Lemon Squeezy)

### What they test

- Component → action → navigation flows
- Cross-module behavior
- Side effects that matter to the user

### What they don’t test

- Supabase internals
- Third-party correctness
- Styling or layout

### Structure

Integration tests are **flow-oriented**, not structure-oriented.

```txt
__tests__/
└─ integration/
   ├─ account-delete.integration.test.tsx
   ├─ billing-redirect.integration.test.tsx
   └─ pricing-signup.integration.test.tsx
```

## 3. End-to-End Tests (Playwright)

**Tools:** Playwright

**Location:** `e2e/`

**File suffix:** `.test.ts`

### Purpose

E2E tests verify **critical user journeys in a real browser**.

They answer questions like:

- _Can two users send and receive messages?_
- _Does the billing flow work end-to-end?_
- _Does an authenticated user see the correct plan state?_

### When E2E is used

Only for **high-risk, business-critical flows**:

- Authentication
- Billing & subscriptions
- Realtime messaging

### When E2E is avoided

- Pure UI behavior
- Logic already covered by unit + integration tests
- Simple redirects or state changes

### Structure

```txt
e2e/
├─ chat-realtime.test.ts
├─ billing-flow.test.ts
└─ utils/
   ├─ seed-user.ts
   ├─ seed-subscription.ts
   ├─ auth.ts
   └─ cleanup.ts
```

## Test Coverage Philosophy

Coverage is **not** a goal.

Instead, the focus is on:

- Core flows
- Irreversible actions
- Cross-system interactions
- Regressions that would break real users

If a behavior is already:

- unit tested **and**
- integration tested

…then adding an E2E test for it is usually unnecessary.

## CI Integration

All test layers run in CI.

### Jest (Unit + Integration)

- Runs on every pull request
- Fast feedback
- Fails the build on regression

### Playwright (E2E)

- Runs in CI against a real browser
- Uses isolated test data
- Cleans up after itself

Both test suites must pass before merge.

## Summary

This testing strategy is intentionally **minimal but robust**:

- **Unit tests** ensure correctness
- **Integration tests** ensure flow integrity
- **E2E tests** ensure real-world confidence

Only **what matters** is tested, **once, at the right level**.
