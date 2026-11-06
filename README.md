<div align="center">

<img src="frontend/public/navpil-logo.png" alt="navpil" width="220" />

### Shared travel expenses — no spreadsheets, no arguments

Log who paid for what, and navpil works out who owes whom
and suggests the **fewest possible transfers** to settle up.

[![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Expo](https://img.shields.io/badge/Expo_SDK_57-000020?logo=expo&logoColor=white)](https://expo.dev)
[![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)

**[🌐 Web app](https://YOUR-APP.vercel.app)** ·
**[⚙️ API](https://api-node-navpil.onrender.com)** ·
**[📖 Swagger docs](https://api-node-navpil.onrender.com/api-docs)**

</div>

> [!NOTE]
> The API runs on Render's free tier: after 15 minutes without requests the server goes to sleep,
> so the first request may take up to a minute. Everything is fast after that.

---

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Running locally](#running-locally)
- [API](#api)
- [How settlement works](#how-settlement-works)
- [Deployment](#deployment)

## Features

- **Trips.** Create a trip with a name, description and dates; its status — *ongoing*, *upcoming* or *finished* — is set automatically.
- **Members.** Invite friends with a code, owner and member roles, remove members.
- **Expenses.** Amount, category, date, who paid and who it's split between. Edit and delete.
- **Analytics.** Trip total, breakdown by category, spending per day and daily average.
- **Settlement.** Every member's balance and the minimal set of transfers; mark a transfer as paid with one tap.
- **Overview.** The home page shows how much you've spent across all trips and your overall balance.
- **Auth.** Sign up and log in with JWT; the session ends automatically when the token expires.
- **Two clients.** A web app for the browser and a mobile app for iOS and Android, both on the same API.

## Screenshots

> The UI is in Ukrainian — the app is built for Ukrainian-speaking travellers, and amounts are in hryvnias (₴).

### Web

#### Your trips at a glance

The home page puts the trip that's happening right now front and center — how much the group has spent
and where you stand. Above it are totals across all your trips: how much you're owed overall,
how many trips you've taken this year and how much you've spent in total.
Upcoming trips show a countdown, past ones move to their own section.

![Trips overview](docs/screenshots/web-trips.png)

#### Everything about one trip

Inside a trip you get four key numbers — total spent, your balance, your share and the daily average.
Below is the full list of expenses with search and an "only mine" filter: each row shows the category,
who paid and who the cost is split between. On the right, a donut chart breaks spending down
by category and bars show how much each member has paid so far.

![Trip expenses and analytics](docs/screenshots/web-trip.png)

### Mobile

The mobile app covers the same flow, rebuilt for one-handed use with native navigation.

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/mobile-trip.png" alt="Trip on mobile" width="280" />
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/mobile-expense.png" alt="Expense details on mobile" width="280" />
    </td>
  </tr>
  <tr>
    <td valign="top">
      <b>Trip.</b> The trip total and your balance up top, a category chart, and tabs for
      expenses, settlement and members. Every expense shows who paid, how it's split and when.
      The <b>+</b> button adds a new one.
    </td>
    <td valign="top">
      <b>Expense details.</b> A full breakdown of a single expense: the amount, how it's divided
      (here equally between two people, 5,000 ₴ each) and what it means for each member —
      who's owed money and who owes. Edit or delete it right here.
    </td>
  </tr>
</table>

## Tech stack

| Part | Stack |
|---|---|
| **Web** | React 19, TypeScript, Vite 8, React Router, TanStack Query 5, SCSS (BEM), Geologica font |
| **Mobile** | Expo SDK 57, React Native 0.86, Expo Router, TanStack Query 5, Expo Secure Store, React Native SVG, Reanimated |
| **Backend** | Node.js, Express 5, TypeScript, Zod 4 (validation), JWT + bcrypt (auth) |
| **Database** | PostgreSQL on Neon, Prisma 7 ORM with migrations |
| **API docs** | OpenAPI generated from Zod schemas (`zod-to-openapi`), Swagger UI |
| **Tests** | Vitest |
| **Deployment** | Vercel (web), Render (API), Neon (database) |

### Under the hood

- **Money in kopecks.** All calculations use whole kopecks, so nothing gets lost to rounding: 100 ₴ split three ways is 33.34 + 33.33 + 33.33.
- **Request caching.** TanStack Query caches data between pages and, after a change, refetches only what actually changed. All cache keys live in one file.
- **Layered backend.** Routes → controllers → services; validation errors come back with per-field details (`422`), and other people's trips are off-limits (`403`).
- **Docs that don't drift.** Swagger is built from the same Zod schemas that validate requests, so the API description always matches real behavior.

## Repository structure

```
navpil/
├── backend/            # REST API: Express + Prisma
│   ├── prisma/         # database schema and migrations
│   └── src/
│       ├── routes/       # routes
│       ├── controllers/  # request handling and status codes
│       ├── services/     # business logic and database access
│       ├── validation/   # Zod schemas
│       └── docs/         # OpenAPI description
├── frontend/           # web client: React + Vite
│   └── src/
│       ├── api/          # API requests
│       ├── hooks/        # useQuery / useMutation
│       ├── pages/        # pages
│       ├── components/   # shared components
│       └── utils/        # settlement, formatting, validation
└── mobile/             # mobile client: Expo + React Native
    └── src/
        ├── app/          # screens (Expo Router file-based routing)
        ├── components/
        ├── hooks/
        └── api/
```

## Running locally

**Requirements:** Node.js 20.19 or newer and a PostgreSQL database (for example, a free one on [Neon](https://neon.tech)).

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
JWT_SECRET_KEY="any-long-random-string"
```

```bash
npm run db:migrate   # create the tables
npm run dev          # http://localhost:3000, Swagger at /api-docs
```

### 2. Web

```bash
cd frontend
npm install
echo 'VITE_API_URL="http://localhost:3000"' > .env
npm run dev          # http://localhost:5173
```

> You can start the backend and the web app together from the repo root: `npm run dev`.

### 3. Mobile app

```bash
cd mobile
npm install
echo 'EXPO_PUBLIC_API_URL=https://api-node-navpil.onrender.com' > .env
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone.

### Tests

```bash
npm test             # from the repo root, runs Vitest for the backend
```

## API

The full interactive reference is in **[Swagger](https://api-node-navpil.onrender.com/api-docs)**. Every route except `/auth` requires an `Authorization: Bearer <token>` header.

| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/register` | Sign up |
| `POST` | `/auth/login` | Log in, returns a JWT |
| `GET` | `/users/me` | Current user |
| `GET` | `/rooms` | My trips: `active`, `upcoming`, `past` |
| `GET` | `/rooms/summary` | Totals and balance across all trips |
| `POST` | `/rooms` | Create a trip |
| `POST` | `/rooms/join` | Join a trip with an invite code |
| `GET` · `PATCH` · `DELETE` | `/rooms/:roomId` | Get, update or delete a trip |
| `DELETE` | `/rooms/:roomId/members/:userId` | Remove a member |
| `GET` · `POST` | `/rooms/:roomId/items` | Trip expenses |
| `GET` · `PATCH` · `DELETE` | `/rooms/:roomId/items/:itemId` | A single expense |
| `GET` · `POST` | `/rooms/:roomId/payments` | Transfers between members |

## How settlement works

1. For each member we calculate **how much they paid** and **their share** of the expenses they take part in.
2. Balance = paid − share, adjusted for transfers already made. Positive means the member is owed money, negative means they owe.
3. Debtors and creditors are sorted by amount, and the largest debt is matched with the largest credit until every balance is zero.

Instead of "everyone pays everyone", this gives the minimum: for four people, at most three transfers instead of up to twelve.

## Deployment

| What | Where | Settings |
|---|---|---|
| API | [Render](https://render.com) | Root: `backend`, build: `npm install && npm run build && npm run db:deploy`, start: `npm start` |
| Web | [Vercel](https://vercel.com) | Root: `frontend`, `VITE_API_URL` variable; `vercel.json` rewrites all paths to `index.html` |
| Database | [Neon](https://neon.tech) | PostgreSQL, connection string in `DATABASE_URL` on Render |

---

<div align="center">

Built by **Artem Baranovskyi** as lab assignments
[Lab 21 — REST API with authentication](https://github.com/rmalkevy/Programming-Practice-Projects/blob/main/labs/lab-21-rest-api-auth.md)
and Lab 30 — a cross-platform mobile app.

</div>
