# neoTaskManager

Production-grade Jira-like shared Kanban board built as a Turborepo monorepo with React, Express, MongoDB, Socket.IO, and shared TypeScript packages.

## Stack

- Monorepo: Turborepo + npm workspaces
- Frontend: React, Vite, Tailwind CSS, React Query, Zustand, dnd-kit, Socket.IO client
- Backend: Node.js, Express, Mongoose, JWT auth with HTTP-only cookies, Socket.IO
- Shared packages: UI components, shared types, shared utilities, shared config
- Testing: Jest + Supertest

## Folder Structure

```text
.
├── apps
│   ├── client
│   │   ├── src
│   │   │   ├── api
│   │   │   ├── app
│   │   │   ├── components
│   │   │   ├── features
│   │   │   │   ├── auth
│   │   │   │   └── board
│   │   │   ├── lib
│   │   │   ├── pages
│   │   │   ├── providers
│   │   │   └── styles
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── server
│       ├── src
│       │   ├── config
│       │   ├── controllers
│       │   ├── db
│       │   ├── middleware
│       │   ├── models
│       │   ├── repositories
│       │   ├── routes
│       │   ├── schemas
│       │   ├── server
│       │   ├── services
│       │   ├── tests
│       │   ├── types
│       │   └── utils
│       ├── jest.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages
│   ├── config
│   ├── types
│   ├── ui
│   └── utils
├── .env.example
├── package.json
├── tsconfig.base.json
└── turbo.json
```

## Architecture Notes

- `apps/client` and `apps/server` do not import from each other directly.
- Shared contracts live in `packages/types`.
- Shared helpers live in `packages/utils`.
- Shared reusable React primitives live in `packages/ui`.
- Shared TS and ESLint base config live in `packages/config`.
- The backend follows `controller -> service -> repository -> model`.
- The frontend consumes only REST + Socket.IO APIs and shared packages.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Ensure MongoDB is running locally.
3. Install dependencies:

```bash
npm install
```

4. Start development servers:

```bash
npm run dev
```

5. App URLs:
- Client: `http://localhost:5173`
- Server: `http://localhost:4000`

## Available Scripts

### Root

```bash
npm run dev
npm run build
npm run test
npm run typecheck
```

### Server

```bash
npm --workspace @neo/server run dev
npm --workspace @neo/server run test
```

### Client

```bash
npm --workspace @neo/client run dev
```

## Product Overview

- Single shared global Kanban board across all users.
- Eight delivery columns:
  - `Backlog`
  - `Selected`
  - `In Progress`
  - `Review`
  - `QA`
  - `Blocked`
  - `Done`
  - `Archived`
- Realtime board sync via Socket.IO for task, assignment, and reorder updates.
- Task modal tabs:
  - `Details`
  - `Assignment History`
  - `Worklogs`
- Time reporting at `/reports/time`.

## Database Design

### `users`

- `name`
- `email` unique indexed
- `passwordHash`
- `refreshTokenVersion`
- timestamps

### `tasks`

- `title` required, max `255`
- `description`
- `status` indexed enum
- `assignee` nullable relation to `users`
- `dueDate`
- `createdBy` relation to `users`
- `position` indexed
- timestamps

Indexes:
- `{ status: 1, position: 1 }`
- `assignee`
- `createdBy`

### `assignment_histories`

- `taskId` relation to `tasks`
- `oldAssignee` nullable relation to `users`
- `newAssignee` nullable relation to `users`
- `changedBy` relation to `users`
- `timestamp`

Indexes:
- `{ taskId: 1, timestamp: -1 }`

### `worklogs`

- `taskId` relation to `tasks`
- `userId` relation to `users`
- `hours`
- `description`
- `createdAt`

Indexes:
- `{ taskId: 1, createdAt: -1 }`
- `userId`

## API Documentation

All mutating auth flows use HTTP-only cookies:
- `neo_access_token`
- `neo_refresh_token`

### `POST /auth/register`

Request:

```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "StrongPass123"
}
```

Response:

```json
{
  "user": {
    "id": "user_id",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "createdAt": "2026-04-22T00:00:00.000Z",
    "updatedAt": "2026-04-22T00:00:00.000Z"
  }
}
```

### `POST /auth/login`

Request:

```json
{
  "email": "alex@example.com",
  "password": "StrongPass123"
}
```

Response: same shape as register.

### `POST /auth/refresh`

Request: empty body, refresh cookie required.

Response: same shape as login.

### `POST /auth/logout`

Response:

```json
{
  "success": true
}
```

### `GET /tasks`

Response:

```json
{
  "columns": [
    {
      "status": "Backlog",
      "tasks": []
    }
  ],
  "users": [
    {
      "id": "user_id",
      "name": "Alex Johnson",
      "email": "alex@example.com"
    }
  ]
}
```

### `POST /tasks`

Request:

```json
{
  "title": "Implement realtime board sync",
  "description": "Socket room events and optimistic refresh",
  "dueDate": "2026-04-30T00:00:00.000Z"
}
```

Response:

```json
{
  "task": {
    "id": "task_id",
    "title": "Implement realtime board sync",
    "description": "Socket room events and optimistic refresh",
    "status": "Backlog",
    "assignee": null,
    "dueDate": "2026-04-30T00:00:00.000Z",
    "createdBy": {
      "id": "user_id",
      "name": "Alex Johnson",
      "email": "alex@example.com"
    },
    "position": 0,
    "createdAt": "2026-04-22T00:00:00.000Z",
    "updatedAt": "2026-04-22T00:00:00.000Z"
  }
}
```

### `GET /tasks/:taskId`

Response:

```json
{
  "task": {
    "id": "task_id",
    "title": "Implement realtime board sync",
    "description": "Socket room events and optimistic refresh",
    "status": "Backlog",
    "assignee": null,
    "dueDate": null,
    "createdBy": {
      "id": "user_id",
      "name": "Alex Johnson",
      "email": "alex@example.com"
    },
    "position": 0,
    "createdAt": "2026-04-22T00:00:00.000Z",
    "updatedAt": "2026-04-22T00:00:00.000Z"
  },
  "assignmentHistory": [],
  "worklogs": []
}
```

### `PATCH /tasks/:taskId`

Request:

```json
{
  "title": "Implement live board sync",
  "description": "Updated description",
  "dueDate": null
}
```

### `POST /tasks/reorder`

Request:

```json
{
  "taskId": "task_id",
  "sourceStatus": "Backlog",
  "destinationStatus": "In Progress",
  "sourceIndex": 0,
  "destinationIndex": 2
}
```

Response: same shape as `GET /tasks`.

### `PATCH /assignments/:taskId`

Request:

```json
{
  "assigneeId": "user_id"
}
```

Response:

```json
{
  "task": {},
  "assignmentHistory": []
}
```

Use `null` to unassign:

```json
{
  "assigneeId": null
}
```

### `POST /worklogs/:taskId`

Request:

```json
{
  "hours": 1.5,
  "description": "Implemented drag and drop persistence"
}
```

Response:

```json
{
  "worklogs": [
    {
      "id": "worklog_id",
      "taskId": "task_id",
      "user": {
        "id": "user_id",
        "name": "Alex Johnson",
        "email": "alex@example.com"
      },
      "hours": 1.5,
      "description": "Implemented drag and drop persistence",
      "createdAt": "2026-04-22T00:00:00.000Z"
    }
  ]
}
```

### `GET /reports/time`

Response:

```json
{
  "rows": [
    {
      "title": "Implement live board sync",
      "status": "In Progress",
      "assignee": "Alex Johnson",
      "totalHours": 4.75
    }
  ],
  "grandTotalHours": 4.75
}
```

## Validation and Error Handling

- Request validation uses `zod`.
- API errors are centralized in `apps/server/src/middleware/error-handler.ts`.
- Domain/service failures use `AppError`.
- Auth routes validate credentials and reject invalid or expired cookies.
- Tasks enforce max title length and safe defaults.
- Worklogs enforce positive decimal hours and immutable create-only writes.

## Realtime Contract

Socket.IO server emits:
- `board:updated`
- `task:details-updated`

These cover:
- task creation and updates
- drag and drop reorder updates
- assignment changes
- worklog/task detail refreshes

## Testing

Mandatory business tests live under `apps/server/src/tests`:

- `worklog.service.test.ts`
- `assignment.service.test.ts`
- `report.service.test.ts`

Run with:

```bash
npm --workspace @neo/server run test
```

`supertest` is included and the server test setup is ready for HTTP-level API coverage when running in an environment that permits ephemeral listener creation.

## Security Notes

- Passwords hashed with `bcryptjs`.
- Access and refresh tokens are set via HTTP-only cookies.
- Refresh tokens use a version counter for invalidation on logout.
- Protected APIs require authenticated access tokens.
- Cookie `secure` mode is enabled automatically in production.

## KPI Checklist

The implementation satisfies the following 44 requested KPIs by code structure and behavior:

1. Turborepo-style monorepo root with workspaces.
2. `apps/client` React frontend.
3. `apps/server` Node.js + Express backend.
4. `packages/ui` shared UI package.
5. `packages/types` shared TypeScript contracts.
6. `packages/utils` shared utilities.
7. `packages/config` shared config package.
8. No direct imports between client and server apps.
9. Shared code flows only through `/packages`.
10. TypeScript used across the entire repository.
11. Absolute import aliases configured via TypeScript paths.
12. Frontend uses React functional components and hooks.
13. Tailwind CSS dark theme uses black, white, and red accent styling.
14. Drag and drop implemented with `dnd-kit`.
15. State/data management uses React Query and Zustand.
16. Backend uses Node.js + Express.
17. Backend uses MongoDB + Mongoose schemas.
18. JWT auth uses access + refresh tokens in HTTP-only cookies.
19. Socket.IO powers realtime sync.
20. Jest + Supertest are configured for testing.
21. Register endpoint implemented.
22. Login endpoint implemented.
23. Logout endpoint implemented.
24. Password hashing implemented with bcrypt.
25. Session persistence implemented via refresh token flow.
26. Protected routes enforced on backend and client shell.
27. Validation and centralized error handling implemented.
28. Single global shared board implemented.
29. Eight Kanban columns implemented with `Backlog` as default.
30. All users see shared board data and receive realtime refresh events.
31. Task creation requires only title and caps title length at 255.
32. Task defaults set `status = Backlog` and `assignee = null`.
33. Task fields include title, description, assignee, dueDate, and createdBy.
34. Task ordering persisted via `position` index.
35. Tasks can move across columns.
36. Tasks can reorder within a column.
37. Drag/drop ordering persists in MongoDB through bulk updates.
38. Drag/drop changes sync via Socket.IO invalidation events.
39. Users can be assigned and unassigned from a dropdown of all users.
40. `assignment_histories` collection records taskId, old/new assignee, changedBy, and timestamp.
41. Assignment history is returned latest first in task details.
42. Worklogs support decimal hours, description, userId, and multiple immutable entries.
43. `/reports/time` returns title, status, assignee, total hours, and project grand total.
44. README includes setup, local development instructions, API docs, and examples.
