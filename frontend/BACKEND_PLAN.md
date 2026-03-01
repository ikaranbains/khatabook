# Backend Plan (Node.js + Express + MongoDB)

This document plans a scalable, secure, robust backend for this finance-manager (KhataBook-style) app.

## Goals

- Provide a reliable API for transactions, budgets, analytics, goals, recurring items, notifications, reports, and imports.
- Support multi-device sync and future multi-user “family/shared budgets”.
- Be secure by default (auth, authorization, validation, rate limiting, audit trail).
- Scale horizontally (stateless API) and handle background workloads (exports, recurring schedules, analytics aggregation).
- Enable operational excellence (logging, metrics, tracing, backups, migrations).

## Non-Goals (For First Iteration)

- Implementing bank integrations (Plaid) end-to-end.
- Real-time collaboration features (live cursors, etc.).
- Building an admin UI (we will keep an admin API + scripts).

## High-Level Architecture

- **Clients**: Next.js web app (current), future mobile.
- **API**: Node.js + Express REST API (JSON over HTTPS).
- **Database**: MongoDB (Atlas recommended) with Mongoose.
- **Cache / Rate limiting / Sessions (optional)**: Redis.
- **Background jobs**: BullMQ (Redis-backed) for heavy/async work.
- **File storage**: S3-compatible (exports, attachments/receipts).
- **Observability**: structured logs (pino), metrics (Prometheus), tracing (OpenTelemetry).

Request flow:

1. Client -> API Gateway / Load Balancer -> Express API
2. Express -> MongoDB (primary reads/writes)
3. Express -> Redis (optional cache, rate limits, job queues)
4. Async workers -> MongoDB/S3/Email providers

## Repository Layout (Proposed)

Keep frontend and backend in one repo, separated clearly.

- `apps/web/` (Next.js) (optional; current repo is at root, can be migrated later)
- `apps/api/` (Express API)
- `packages/shared/` (shared types/schemas; optional)
- `infra/` (docker compose, k8s manifests, terraform; optional)
- `docs/` (architecture and API docs)

If we avoid a monorepo restructure initially, add `backend/` at root.

## API Style & Versioning

- REST endpoints under `/api/v1/...`.
- JSON:API-like consistency (not strictly compliant):
  - consistent envelope for pagination and errors
  - `id` strings, ISO dates, explicit `currency`
- Idempotency for write endpoints that can be retried (optional initially): `Idempotency-Key` header.

## Multi-Tenancy Model (Future-Proofing)

Even if today it’s “single user”, design for shared budgets:

- **Workspace**: logical container for data (personal or family).
- All domain models include `workspaceId`.
- Membership roles: `owner`, `admin`, `editor`, `viewer`.
- Authorization checks are always `userId` + membership on `workspaceId`.

## Authentication & Session Management

Recommended approach for web + mobile:

- **Access token**: short-lived JWT (5–15 minutes).
- **Refresh token**: long-lived, stored hashed in DB, rotated on use.
- For the web client:
  - store tokens in **httpOnly secure cookies**
  - implement CSRF protection (double-submit cookie or CSRF token endpoint)
- For mobile:
  - store refresh token in secure storage; access token in memory.

Auth endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET  /api/v1/auth/me`

Security add-ons (phase 2):

- Optional 2FA (TOTP) for “Advanced Security” feature.
- Device/session management (list and revoke sessions).

## Authorization

- Central policy layer: `can(user, action, resource)`.
- Enforce at route layer and optionally at query layer.
- Role-to-permission mapping per workspace.
- Audit on sensitive actions (exports, deletions, membership changes).

## Core Domain Model (MongoDB Collections)

All documents include:

- `createdAt`, `updatedAt`
- `createdBy` (user id)
- `workspaceId`
- optional `deletedAt` for soft-delete where required

### Users

- `_id`
- `email` (unique, lowercased)
- `passwordHash`
- `name`
- `status` (active, disabled)
- `lastLoginAt`
- `mfa` (optional)

### Workspaces

- `_id`
- `name`
- `type` (personal, family)
- `defaultCurrency`

### WorkspaceMembers

- `_id`
- `workspaceId`
- `userId`
- `role`
- `invitedBy` + `invitedAt` (optional)

### Accounts (optional but recommended)

Represents cash/bank/wallet sources.

- `_id`
- `workspaceId`
- `name`
- `type` (cash, bank, card, upi, other)
- `currency`
- `openingBalance`

### Categories

- `_id`
- `workspaceId`
- `name`
- `type` (income, expense)
- `color` (optional)
- `isSystem` (true for seeded defaults)

### Transactions

- `_id`
- `workspaceId`
- `type` (income, expense, transfer)
- `amount` (integer minor units preferred, e.g., paise/cents)
- `currency`
- `description`
- `date` (ISO)
- `categoryId` (nullable)
- `accountId` (nullable)
- `tags` (array)
- `counterparty` (optional)
- `attachments` (S3 keys; optional)
- `source` (manual, import, recurring, bank)
- `meta` (gst fields, import provenance, etc.)

Indexes:

- `{ workspaceId: 1, date: -1 }`
- `{ workspaceId: 1, type: 1, date: -1 }`
- `{ workspaceId: 1, categoryId: 1, date: -1 }`
- Text index (careful) on `description` for search.

### Budgets

- `_id`
- `workspaceId`
- `period` (monthly, weekly, yearly)
- `startDate`, `endDate` (or computed by period)
- `currency`
- `rules`: array of
  - `categoryId` or `tag`
  - `limitAmount`
- `alerts`: thresholds (80%, 90%, 100%)

### Goals

- `_id`
- `workspaceId`
- `name`
- `targetAmount`
- `currentAmount`
- `deadline`
- `priority`
- `notes`

### RecurringTransactions

- `_id`
- `workspaceId`
- `type` (income, expense)
- `amount`
- `currency`
- `description`
- `categoryId`
- `accountId`
- `frequency` (daily, weekly, biweekly, monthly, yearly)
- `timezone`
- `nextRunAt`
- `endAt` (nullable)
- `isActive`

### Notifications

- `_id`
- `workspaceId`
- `userId` (recipient)
- `type`
- `severity`
- `title`, `message`
- `readAt`
- `data` (action links, entity ids)

### Imports

- `_id`
- `workspaceId`
- `source` (csv, excel, bank)
- `status` (uploaded, parsing, validated, applied, failed)
- `fileKey` (S3)
- `summary` (counts)
- `errors` (first N)

### Reports / Exports

- `_id`
- `workspaceId`
- `type` (csv, pdf)
- `status` (queued, processing, ready, failed)
- `params` (date ranges, filters)
- `resultFileKey` (S3)
- `requestedBy`

## API Surface (v1)

### Conventions

- Pagination: `?limit=50&cursor=...` (cursor-based).
- Sorting: `?sort=-date`.
- Filtering: `?type=expense&categoryId=...&from=YYYY-MM-DD&to=...&q=...`.
- Standard errors: `{ code, message, details, requestId }`.

### Workspaces

- `GET  /api/v1/workspaces`
- `POST /api/v1/workspaces`
- `GET  /api/v1/workspaces/:id`
- `PATCH /api/v1/workspaces/:id`
- `GET  /api/v1/workspaces/:id/members`
- `POST /api/v1/workspaces/:id/members` (invite/add)
- `PATCH /api/v1/workspaces/:id/members/:memberId` (role)
- `DELETE /api/v1/workspaces/:id/members/:memberId`

### Categories

- `GET  /api/v1/categories`
- `POST /api/v1/categories`
- `PATCH /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`

### Accounts

- `GET  /api/v1/accounts`
- `POST /api/v1/accounts`
- `PATCH /api/v1/accounts/:id`
- `DELETE /api/v1/accounts/:id`

### Transactions

- `GET  /api/v1/transactions`
- `POST /api/v1/transactions`
- `GET  /api/v1/transactions/:id`
- `PATCH /api/v1/transactions/:id`
- `DELETE /api/v1/transactions/:id`

Bulk operations (phase 2):

- `POST /api/v1/transactions/bulk` (insert)
- `PATCH /api/v1/transactions/bulk` (update)

### Budgets

- `GET  /api/v1/budgets`
- `POST /api/v1/budgets`
- `PATCH /api/v1/budgets/:id`
- `DELETE /api/v1/budgets/:id`

### Goals

- `GET  /api/v1/goals`
- `POST /api/v1/goals`
- `PATCH /api/v1/goals/:id`
- `DELETE /api/v1/goals/:id`

### Recurring

- `GET  /api/v1/recurring`
- `POST /api/v1/recurring`
- `PATCH /api/v1/recurring/:id`
- `DELETE /api/v1/recurring/:id`

### Analytics

Derived views; computed server-side and optionally cached:

- `GET /api/v1/analytics/summary?from=...&to=...`
- `GET /api/v1/analytics/trends?interval=month&from=...&to=...`
- `GET /api/v1/analytics/categories?from=...&to=...&type=expense`
- `GET /api/v1/analytics/health-score?asOf=...` (phase 2)

### Reports / Exports

- `POST /api/v1/exports` (queue export)
- `GET  /api/v1/exports` (list)
- `GET  /api/v1/exports/:id` (status)

### Notifications

- `GET   /api/v1/notifications`
- `PATCH /api/v1/notifications/:id` (mark read)

### Imports

- `POST /api/v1/imports` (create import + upload init)
- `POST /api/v1/imports/:id/parse`
- `POST /api/v1/imports/:id/apply`
- `GET  /api/v1/imports/:id`

## Input Validation & Schema Strategy

- Use Zod (recommended) or Joi for request validation.
- Validate at boundaries:
  - request body
  - query params
  - path params
- Sanitize and normalize:
  - trim descriptions
  - lower-case emails
  - enforce amount integer minor units

## Security Plan

### Transport & Headers

- Enforce HTTPS everywhere (TLS termination at LB).
- `helmet` for security headers.
- Strict CORS allowlist (dev + prod origins).

### Rate Limiting & Abuse Prevention

- Rate limits per IP and per user (Redis-backed preferred).
- Stronger limits for auth endpoints.
- Account lockouts / progressive delays on failed logins.

### Data Protection

- Hash passwords with bcrypt/argon2.
- Refresh tokens stored hashed; rotate on use.
- Encrypt sensitive fields if required (e.g., attachments metadata) using KMS-managed keys.
- Least-privilege DB user; separate read/write roles if needed.

### Authorization Hardening

- Workspace membership check for every query.
- Prevent IDOR by scoping by `workspaceId` on all reads/writes.

### Audit Logging (Phase 2)

- Track: login, password change, export generation, bulk import apply, membership changes, data deletion.
- Store: `actorUserId`, `workspaceId`, `action`, `target`, `ip`, `userAgent`, `createdAt`.

## Background Jobs

Use BullMQ workers for:

- Recurring transaction generation
- Export generation (CSV/PDF)
- Import parsing and validation
- Notifications scheduling and delivery
- Periodic analytics materialization (optional)

Job reliability:

- retries with backoff
- dead-letter queue
- idempotent job handlers

## Analytics Strategy

### Phase 1 (Simple + Correct)

- Compute analytics on-demand from `transactions` using indexed queries and aggregation pipelines.
- Cache responses in Redis for short periods (30–120s) for dashboards.

### Phase 2 (Scalable)

- Materialized rollups:
  - daily totals per category/type
  - monthly totals per category/type
- Update rollups incrementally on transaction writes.
- Use these rollups for trends and charts.

## Data Integrity & Concurrency

- Use MongoDB transactions for multi-document operations where required (e.g., transfers across accounts).
- Prefer immutable ledger-like writes for financial data; avoid silent overwrites:
  - keep `updatedAt` and optionally `revision` for optimistic concurrency.
- Soft-delete transactions if auditability is desired.

## Performance & Scaling

- Stateless API instances behind a load balancer.
- MongoDB:
  - ensure compound indexes match query patterns
  - avoid unbounded array growth
  - consider sharding by `workspaceId` at very large scale
- Use caching sparingly and invalidate by workspace.
- Use streaming exports to avoid memory spikes.

## Observability

- Structured logs with request ids.
- Metrics:
  - request latency (p50/p95/p99)
  - error rates per route
  - queue depth, job duration, failures
- Tracing:
  - propagate trace id from gateway -> API -> DB
- Alerting:
  - high error rate
  - DB connection issues
  - queue backlog

## Environments & Configuration

Use environment variables for configuration (12-factor):

- `NODE_ENV`, `PORT`
- `MONGODB_URI`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- `LOG_LEVEL`

Secrets management:

- Local dev: `.env` (never committed)
- Production: managed secrets (AWS Secrets Manager / Doppler / Vault)

## Deployment Plan

- Containerize API + worker(s).
- Separate services:
  - `api` (HTTP)
  - `worker` (jobs)
  - `scheduler` (optional; or use worker with repeatable jobs)
- Use MongoDB Atlas and managed Redis.
- CI/CD:
  - run tests + lint
  - build container images
  - deploy to staging then prod

## Testing Strategy

- Unit tests: services, validators, policy layer.
- Integration tests: API routes with a test MongoDB (container) and supertest.
- Contract tests: OpenAPI schema validation of responses.
- Load tests (phase 2): k6 scenarios for dashboard and transaction listing.

## API Documentation

- Maintain OpenAPI spec (`openapi.yaml`) as source of truth.
- Generate:
  - Swagger UI
  - typed client for frontend (optional)

## Migration From Current LocalStorage Frontend

Phased rollout:

1. Add auth + workspace + transactions CRUD.
2. Update frontend to read/write via API (feature-flagged).
3. Add import endpoint to migrate existing local data into MongoDB.
4. Add analytics endpoints.
5. Add recurring + exports + notifications.

Data import plan:

- Frontend exports LocalStorage JSON.
- Backend provides `POST /imports/localstorage` to validate and ingest.
- Deduplicate via deterministic keys (date + amount + description + category) with tolerance rules.

## Open Decisions (We Can Lock In Early)

- Token transport for web: cookies (recommended) vs Authorization headers.
- Amount representation: integer minor units (recommended) vs decimal.
- Soft-delete vs hard-delete for transactions.
- Whether to model accounts immediately or later.

## Milestones

- M1: Auth + workspace + categories + transactions CRUD + search/filter.
- M2: Budgets + goals.
- M3: Analytics endpoints (summary, trends, categories).
- M4: Recurring engine + notifications.
- M5: Imports + exports + audit log.
