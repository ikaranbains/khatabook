# Backend API

Express + MongoDB backend for the finance-manager platform.

## Features

- Node.js + Express + MongoDB (Mongoose)
- dotenv + CORS + Helmet + compression + rate limiting
- Workspace-scoped data model (future-ready for multi-tenant)
- CRUD APIs for workspaces, categories, transactions, budgets, goals
- Analytics endpoints (summary, trends, categories)
- Zod validation + centralized error handling

## Setup

1. Create env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start backend:

```bash
npm run dev
```

Server runs on `http://localhost:5000` by default.

## API Base

- Base URL: `http://localhost:5000/api/v1`
- Health: `GET /health`

## Core Endpoints

- `GET/POST/PATCH` `/workspaces`
- `GET/POST/PATCH/DELETE` `/categories`
- `GET/POST/GET:id/PATCH:id/DELETE:id` `/transactions`
- `GET/POST/PATCH/DELETE` `/budgets`
- `GET/POST/PATCH/DELETE` `/goals`
- `GET` `/analytics/summary`
- `GET` `/analytics/trends`
- `GET` `/analytics/categories`

## Workspace Scoping

All domain endpoints are scoped by workspace.

- Pass header `x-workspace-id` to target a workspace, or
- Backend auto-creates/uses a default workspace for local development.
