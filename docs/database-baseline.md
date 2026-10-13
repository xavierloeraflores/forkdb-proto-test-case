# Database baseline for the ForkDB demo

Captured on October 12, 2026 at 7:28:26 PM PDT. This is the source database before creating the three database forks and their Git worktrees.

## Source database

- Database: `forkdb_tasks`
- PostgreSQL endpoint: `127.0.0.1:55433`
- Schema: `public`
- Application table: `tasks`, with **15 rows**
- Prisma migration table: `_prisma_migrations`, with 1 row
- Snapshot timestamp in UTC: `2026-10-13T02:28:26.045Z`

The table below contains every application row read directly from PostgreSQL. Creation timestamps use UTC. The screenshot also displays dates in UTC, so its October 13 date corresponds to the evening of October 12 in Los Angeles.

## App screenshot

The running app at [127.0.0.1:3000](http://127.0.0.1:3000) displays these same 15 tasks. This screenshot is saved alongside this document so it can travel with the repository.

![The to-do app displaying all 15 baseline tasks](assets/tasks-baseline.jpg)

## Task schema

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Task {
  id        String   @id @default(uuid()) @db.Uuid
  name      String   @db.VarChar(200)
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  @@map("tasks")
}
```

## Complete task contents

Rows follow the app's order, newest first, with descending IDs to break timestamp ties. All examples were inserted in one batch, so they share a creation timestamp.

| ID | Name | Created at, UTC |
| --- | --- | --- |
| `d769a3c0-30fd-4b7b-8d95-000000000015` | Write down three project ideas | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000014` | Pick a recipe to try | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000013` | Update the monthly budget | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000012` | Call a friend | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000011` | Schedule a dentist appointment | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000010` | Prepare lunch for tomorrow | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000009` | Organize the downloads folder | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000008` | Review the project README | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000007` | Back up important files | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000006` | Clean the desk | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000005` | Go for a walk | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000004` | Read a chapter of a book | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000003` | Water the plants | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000002` | Buy groceries | `2026-10-13T02:25:34.107Z` |
| `d769a3c0-30fd-4b7b-8d95-000000000001` | Plan the week | `2026-10-13T02:25:34.107Z` |

## Prisma migration contents

This is the complete migration tracking row. It is Prisma's internal metadata; the application has no users or other domain tables.

```json
[
  {
    "id": "b82a1682-b858-4bba-8bb1-82a41cba42ea",
    "checksum": "9c12759ef0b4a5e0fd1dd9d1c4ff50accaaad236013da4136773275ee76e7d44",
    "finished_at": "2026-10-13T02:20:53.299Z",
    "migration_name": "20261013022053_init",
    "logs": null,
    "rolled_back_at": null,
    "started_at": "2026-10-13T02:20:53.297Z",
    "applied_steps_count": 1
  }
]
```

## Using this baseline for the three-fork demo

1. Clone this populated source database into three forks. Before changing data, each fork should contain these same 15 IDs, names, and creation timestamps.
2. Point each Git worktree's local `DATABASE_URL` at its corresponding database fork and run each app on a different port. The local environment file is ignored by Git, so configure it separately in each worktree.
3. Make a different change in each fork, such as renaming a task in the first, adding a task in the second, and deleting a task in the third.
4. Compare each fork against this document. Verify that the source and other forks retain their own data.

The forks have not been created yet. This document records the starting state and should remain unchanged while demonstrating fork isolation.

To inspect a fork's task contents:

```sql
SELECT id, name, "createdAt"
FROM public.tasks
ORDER BY "createdAt" DESC, id DESC;
```

`pnpm db:seed` is available to populate a new empty database. It skips existing example IDs but recreates deleted examples, so do not run it on the forks during the isolation demo. Clone the populated source instead to preserve the original timestamps.
