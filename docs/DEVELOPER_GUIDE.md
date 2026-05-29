# IMTA Resume - Developer Guide

A comprehensive guide for developers contributing to or building on IMTA Resume.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Development Environment](#development-environment)
4. [Project Structure](#project-structure)
5. [Authentication System](#authentication-system)
6. [ORPC API Development](#orpc-api-development)
7. [Database Operations](#database-operations)
8. [AI Integration](#ai-integration)
9. [Frontend Development](#frontend-development)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Contributing Guidelines](#contributing-guidelines)

---

## Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **pnpm** 8.x or later (recommended package manager)
- **Docker** and Docker Compose (for local services)
- **Git** for version control

### Quick Start

```bash
# Clone the repository
git clone https://imta.ma/imta-resume.git
cd imta-resume

# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Start required services (PostgreSQL, Browserless, SeaweedFS, Mailpit)
docker compose -f compose.dev.yml up -d

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Development Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Browserless | 4000 | PDF generation (Chromium) |
| SeaweedFS | 8333 | S3-compatible file storage |
| Mailpit | 1025, 8025 | Email testing (SMTP + Web UI) |
| Adminer | 8080 | Database management UI |

---

## Architecture Overview

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | TanStack Start (React 19 + Vite) |
| Runtime | Node.js |
| Language | TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| API | ORPC (Type-safe RPC) |
| Authentication | Better Auth |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI |
| State Management | Zustand + TanStack Query |
| Internationalization | Lingui |

### Request Flow

```
Browser Request
      |
      v
TanStack Router (File-based routing)
      |
      v
React Component (src/routes/)
      |
      v
ORPC Client (Type-safe API calls)
      |
      v
ORPC Router (src/integrations/orpc/router/)
      |
      v
Service Layer (src/integrations/orpc/services/)
      |
      v
Drizzle ORM (Database operations)
      |
      v
PostgreSQL
```

---

## Development Environment

### Environment Variables

Create a `.env` file from `.env.example`. Key variables:

```bash
# Application
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres

# Authentication
AUTH_SECRET=your-auth-secret-min-32-chars

# PDF Generation
PRINTER_ENDPOINT=http://localhost:4000

# S3 Storage
S3_ENDPOINT=http://localhost:8333
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=imta-resume

# Email (Mailpit for development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@localhost

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Feature Flags
FLAG_DISABLE_SIGNUPS=false
FLAG_DISABLE_EMAIL_AUTH=false
```

### Available Scripts

```bash
# Development
pnpm dev              # Start development server (port 3000)
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run Biome linter
pnpm typecheck        # Run TypeScript type checking
pnpm knip             # Find unused exports

# Database
pnpm db:generate      # Generate migration files from schema changes
pnpm db:migrate       # Run pending migrations
pnpm db:push          # Push schema changes directly (dev only)
pnpm db:studio        # Open Drizzle Studio (database GUI)

# Internationalization
pnpm lingui:extract   # Extract translatable strings
```

---

## Project Structure

```
imta-resume/
├── docs/                    # Documentation
├── locales/                 # i18n translation files
├── migrations/              # Drizzle database migrations
├── plugins/                 # Nitro server plugins
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── resume/          # Resume-specific components
│   │   │   ├── builder/     # Resume editor components
│   │   │   ├── shared/      # Shared resume components
│   │   │   ├── store/       # Zustand stores for resume state
│   │   │   └── templates/   # Resume template components
│   │   └── ui/              # Shared UI components (shadcn/ui)
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External service integrations
│   │   ├── auth/            # Better Auth configuration
│   │   ├── drizzle/         # Database schema and client
│   │   ├── email/           # Email service
│   │   ├── orpc/            # ORPC API layer
│   │   │   ├── router/      # API route handlers
│   │   │   ├── services/    # Business logic services
│   │   │   ├── context.ts   # Procedure middleware
│   │   │   └── client.ts    # ORPC client configuration
│   │   └── query/           # TanStack Query configuration
│   ├── routes/              # TanStack Router file-based routes
│   │   ├── _home/           # Public landing pages
│   │   ├── auth/            # Authentication pages
│   │   ├── builder/         # Resume editor
│   │   ├── dashboard/       # User dashboard
│   │   └── api/             # API route handlers
│   ├── schema/              # Zod validation schemas
│   └── utils/               # Utility functions
└── package.json
```

---

## Authentication System

### Overview

IMTA Resume uses **Better Auth** for authentication, configured in `src/integrations/auth/config.ts`.

### Supported Authentication Methods

1. **Email/Password**
   - Minimum 12 characters (NIST SP 800-63B compliant)
   - Email verification required in production
   - Password hashing with bcrypt

2. **OAuth Providers**
   - Google OAuth 2.0
   - GitHub OAuth
   - Custom OpenID Connect provider

3. **Two-Factor Authentication**
   - TOTP-based (authenticator apps)

4. **Passkeys**
   - WebAuthn/FIDO2 support

5. **API Keys**
   - For programmatic access
   - Rate limited (500 requests/day)

### User Roles

```typescript
type UserRole = "user" | "admin" | "partner";
```

| Role | Permissions |
|------|-------------|
| `user` | Standard user access |
| `admin` | Full administrative access |
| `partner` | Extended access (custom) |

### Authentication in ORPC

```typescript
// src/integrations/orpc/context.ts

// Public - no authentication required
export const publicProcedure = base.use(async ({ context, next }) => {
  const user = await getUserFromHeaders(context.reqHeaders);
  return next({ context: { ...context, user } });
});

// Protected - requires authenticated user
export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
  if (!context.user) throw new ORPCError("UNAUTHORIZED");
  return next({ context });
});

// Admin - requires admin role
export const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
  if (context.user.role !== "admin") {
    throw new ORPCError("FORBIDDEN", { message: "Admin privileges required" });
  }
  return next({ context });
});

// Rate limited procedures
export const aiRateLimitedProcedure = protectedProcedure.use(/* ... */);
export const uploadRateLimitedProcedure = protectedProcedure.use(/* ... */);
```

### Session Management

Sessions are managed via HTTP-only cookies. API key authentication is supported via the `x-api-key` header.

```typescript
// Authenticating with API key
const response = await fetch("/api/orpc/resume/list", {
  headers: {
    "x-api-key": "your-api-key"
  }
});
```

---

## ORPC API Development

### Creating a New Router

1. **Create the service** in `src/integrations/orpc/services/`:

```typescript
// src/integrations/orpc/services/my-feature.ts
import { db } from "@/integrations/drizzle/client";
import { myTable } from "@/integrations/drizzle/schema";

export const myFeatureService = {
  async list(userId: string) {
    return await db.select().from(myTable).where(eq(myTable.userId, userId));
  },

  async create(data: { userId: string; name: string }) {
    const [result] = await db.insert(myTable).values(data).returning();
    return result.id;
  },

  async delete(id: string, userId: string) {
    await db.delete(myTable)
      .where(and(eq(myTable.id, id), eq(myTable.userId, userId)));
  }
};
```

2. **Create the router** in `src/integrations/orpc/router/`:

```typescript
// src/integrations/orpc/router/my-feature.ts
import z from "zod";
import { protectedProcedure } from "../context";
import { myFeatureService } from "../services/my-feature";

export const myFeatureRouter = {
  list: protectedProcedure
    .route({
      method: "GET",
      path: "/my-feature",
      tags: ["My Feature"],
      summary: "List all items",
      description: "Get all items for the authenticated user.",
    })
    .output(z.array(z.object({
      id: z.string(),
      name: z.string(),
      createdAt: z.date(),
    })))
    .handler(async ({ context }) => {
      return await myFeatureService.list(context.user.id);
    }),

  create: protectedProcedure
    .route({
      method: "POST",
      path: "/my-feature",
      tags: ["My Feature"],
      summary: "Create a new item",
    })
    .input(z.object({
      name: z.string().min(1).max(255),
    }))
    .output(z.string())
    .handler(async ({ context, input }) => {
      return await myFeatureService.create({
        userId: context.user.id,
        name: input.name,
      });
    }),

  delete: protectedProcedure
    .route({
      method: "DELETE",
      path: "/my-feature/{id}",
      tags: ["My Feature"],
      summary: "Delete an item",
    })
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .handler(async ({ context, input }) => {
      await myFeatureService.delete(input.id, context.user.id);
    }),
};
```

3. **Register the router** in `src/integrations/orpc/router/index.ts`:

```typescript
import { myFeatureRouter } from "./my-feature";

export default {
  // ... existing routers
  myFeature: myFeatureRouter,
};
```

### Router Best Practices

1. **Always define route metadata** for OpenAPI documentation
2. **Use Zod schemas** for input/output validation
3. **Handle errors with ORPCError** for consistent error responses
4. **Log important operations** for debugging
5. **Use transactions** for multi-step database operations

### Using the ORPC Client

```typescript
// In React components
import { orpc } from "@/integrations/orpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";

// Query
const { data, isLoading } = useQuery({
  queryKey: ["myFeature", "list"],
  queryFn: () => orpc.myFeature.list(),
});

// Mutation
const mutation = useMutation({
  mutationFn: (data) => orpc.myFeature.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["myFeature"] });
  },
});
```

---

## Database Operations

### Schema Definition

Define tables in `src/integrations/drizzle/schema.ts`:

```typescript
import { pgTable, uuid, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const myTable = pgTable("my_table", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Migration Workflow

```bash
# 1. Make changes to schema.ts

# 2. Generate migration
pnpm db:generate

# 3. Review generated migration in migrations/

# 4. Run migration
pnpm db:migrate

# Or for development, push directly (skips migrations)
pnpm db:push
```

### Common Query Patterns

```typescript
import { db } from "@/integrations/drizzle/client";
import { eq, and, or, desc, sql, count } from "drizzle-orm";

// Select with conditions
const items = await db
  .select()
  .from(myTable)
  .where(and(
    eq(myTable.userId, userId),
    eq(myTable.isActive, true)
  ))
  .orderBy(desc(myTable.createdAt))
  .limit(10);

// Insert with returning
const [newItem] = await db
  .insert(myTable)
  .values({ userId, name: "New Item" })
  .returning();

// Update
await db
  .update(myTable)
  .set({ name: "Updated", updatedAt: new Date() })
  .where(eq(myTable.id, itemId));

// Delete
await db
  .delete(myTable)
  .where(eq(myTable.id, itemId));

// Aggregate
const [{ total }] = await db
  .select({ total: count() })
  .from(myTable)
  .where(eq(myTable.userId, userId));

// Join
const itemsWithUser = await db
  .select({
    item: myTable,
    userName: user.name,
  })
  .from(myTable)
  .innerJoin(user, eq(myTable.userId, user.id));
```

### Database Type Gotchas

- `numeric` columns return as strings
- `count()` returns bigint string, use `Number()` to convert
- Timestamps in JSON responses are strings, not Date objects

---

## AI Integration

### Overview

IMTA Resume supports multiple AI providers through a unified interface:

- OpenAI
- Anthropic (Claude)
- Google Gemini
- Ollama (local)
- DeepSeek
- Groq
- Mistral
- Together AI
- OpenRouter
- Vercel AI Gateway

### AI Configuration System

AI providers are configured by administrators in the database. The configuration includes:

- Provider type and API key
- Model selection
- Base URL (for custom endpoints)
- Token limits and temperature
- Enable/disable status

### Using AI in Services

```typescript
import { aiConfigService } from "../services/ai-config";
import { generateText, streamText } from "ai";

async function getServerModel() {
  const config = await aiConfigService.getActiveProvider();
  if (!config) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "No AI provider configured",
    });
  }

  return getModel({
    provider: config.provider,
    model: config.model,
    apiKey: config.apiKey,
    baseURL: config.baseUrl || "",
  });
}

// Non-streaming
async function generateContent(prompt: string) {
  const model = await getServerModel();
  const result = await generateText({
    model,
    messages: [{ role: "user", content: prompt }],
  });
  return result.text;
}

// Streaming
async function* streamContent(prompt: string) {
  const model = await getServerModel();
  const stream = streamText({
    model,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const chunk of stream.textStream) {
    yield chunk;
  }
}
```

### AI Usage Tracking

All AI operations are logged for quota enforcement and analytics:

```typescript
import { aiQuotaService } from "../services/ai-quota";

// Log AI usage
await aiQuotaService.logUsage({
  userId,
  feature: "improve_content",
  requestTokens: result.usage?.inputTokens ?? 0,
  responseTokens: result.usage?.outputTokens ?? 0,
  totalTokens: result.usage?.totalTokens ?? 0,
  durationMs: endTime - startTime,
  status: "success",
  model: config.model,
  provider: config.provider,
});
```

---

## Frontend Development

### Component Organization

```
src/components/
├── resume/
│   ├── builder/          # Resume editor components
│   │   ├── sections/     # Section-specific editors
│   │   └── sidebars/     # Editor sidebars
│   ├── shared/           # Shared resume rendering
│   │   ├── sections/     # Section renderers
│   │   └── index.tsx     # Main resume renderer
│   ├── store/            # Zustand stores
│   │   ├── resume.ts     # Resume data store
│   │   └── builder.ts    # Builder UI state
│   └── templates/        # Template components
│       ├── azurill/
│       ├── bronzor/
│       └── ...
└── ui/                   # Shared UI components (shadcn/ui)
```

### State Management

**Resume State (Zustand)**

```typescript
import { useResumeStore } from "@/components/resume/store";

// Access resume data
const resumeData = useResumeStore((state) => state.data);
const setBasics = useResumeStore((state) => state.setBasics);

// Update resume
setBasics({ name: "John Doe", email: "john@example.com" });
```

**Server State (TanStack Query)**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/integrations/orpc/client";

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ["resumes"],
  queryFn: () => orpc.resume.list(),
});

// Mutations with cache invalidation
const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: (data) => orpc.resume.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["resumes"] });
  },
});
```

### Styling with Tailwind CSS

```typescript
import { cn } from "@/utils/cn";

// Conditional classes
<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary bg-primary/10",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Content
</div>
```

### Internationalization

```typescript
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";

function MyComponent() {
  const { _ } = useLingui();

  return (
    <div>
      {/* Static text */}
      <Trans>Welcome to IMTA Resume</Trans>

      {/* With variables */}
      <Trans>Hello, {name}!</Trans>

      {/* In JavaScript */}
      {_("Save Changes")}
    </div>
  );
}
```

### Route Protection

```typescript
// src/routes/dashboard/index.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async ({ context }) => {
    // Redirect unauthenticated users
    if (!context.session?.user) {
      throw redirect({ to: "/auth/login" });
    }
  },
  loader: async ({ context }) => {
    // Load data for authenticated users
    return { user: context.session.user };
  },
});
```

---

## Testing

### Testing Strategy

1. **Unit Tests**: Individual functions and utilities
2. **Integration Tests**: API endpoints and database operations
3. **E2E Tests**: Full user workflows

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/utils/string.test.ts

# Watch mode
pnpm test --watch
```

### Writing Tests

```typescript
// src/utils/string.test.ts
import { describe, it, expect } from "vitest";
import { slugify, generateRandomName } from "./string";

describe("slugify", () => {
  it("converts string to URL-safe slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("My Resume 2024")).toBe("my-resume-2024");
  });

  it("handles special characters", () => {
    expect(slugify("Cafe & Restaurant")).toBe("cafe-restaurant");
  });
});
```

---

## Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-slim

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment Configuration

Production environment variables:

```bash
# Required
APP_URL=https://your-domain.com
DATABASE_URL=postgres://user:pass@host:5432/db
AUTH_SECRET=minimum-32-character-secret

# Optional but recommended
PRINTER_ENDPOINT=https://your-printer-service
S3_ENDPOINT=https://your-s3-compatible-storage
```

### Health Checks

The application exposes health check endpoints:

- `GET /api/health` - Basic health check
- `GET /api/orpc/admin/system/health` - Detailed system health (admin only)

---

## Contributing Guidelines

### Code Style

- **Linting**: Biome (run `pnpm lint`)
- **Formatting**: Tabs, double quotes, 120 character line width
- **Path Aliases**: Use `@/` for `src/` imports
- **Class Names**: Use `cn()` for conditional Tailwind classes

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run linting and type checking:
   ```bash
   pnpm lint
   pnpm typecheck
   ```
5. Commit with clear messages
6. Push and create a pull request

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(ai): add skill suggestion endpoint
fix(resume): handle empty sections in PDF export
docs: update API reference for auth endpoints
```

### Important Notes

1. **No Mock Data**: All features must use real database operations
2. **Backend First**: Create database schema and API before frontend
3. **Type Safety**: Leverage TypeScript and Zod for type safety
4. **SSR Safety**: Use `enabled: !!session?.user` for protected queries

---

## Support

- **Documentation**: [imta.ma](https://imta.ma)
- **GitHub Issues**: [Report bugs or request features](https://imta.ma)
- **Discord**: [Join the community](https://discord.gg/EE8yFqW4)
- **Email**: contact@imta.ma
