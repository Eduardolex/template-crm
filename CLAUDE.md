# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server Commands
```bash
npm run dev          # Start development server (with webpack)
npm run build        # Build for production (generates Prisma client first)
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Commands
```bash
# Prisma
npx prisma migrate dev                    # Create and apply new migration
npx prisma migrate dev --name <name>      # Create named migration
npx prisma migrate deploy                 # Deploy migrations (production)
npx prisma generate                       # Regenerate Prisma client after schema changes
npx prisma studio                         # Open database GUI
npx prisma db seed                        # Run seed script (creates demo data)

# Quick commands (via package.json)
npm run db:push      # Push schema without migration (dev only)
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

### Docker (PostgreSQL)
```bash
npm run docker:up    # Start PostgreSQL container
npm run docker:down  # Stop PostgreSQL container
npm run setup        # Complete setup: docker + db push + seed
```

### Demo Credentials
- Email: `demo@demo.com`
- Password: `demo123`

## Architecture Overview

### Multi-Tenant Architecture

This is a **strict multi-tenant CRM** where every piece of data belongs to exactly one tenant. The architecture enforces complete data isolation at every layer.

**Tenant Isolation Flow:**
```
User Login → JWT Token (contains tenantId) → HTTP-only Cookie
    ↓
Every Request → getTenantContext() extracts tenantId from session
    ↓
All DB Queries → Automatically scoped: WHERE tenantId = <session.tenantId>
    ↓
Complete Data Isolation (impossible to access other tenant data)
```

**Critical Pattern - ALWAYS use tenant context:**
```typescript
// ✅ CORRECT
const { tenantId, userId } = await getTenantContext();
await prisma.contact.findMany({ where: { tenantId } });

// ❌ WRONG - Missing tenant isolation
await prisma.contact.findMany({});  // Security vulnerability!
```

**Key Files:**
- `src/lib/db/tenant-context.ts` - Tenant isolation logic (`getTenantContext()`, `requireAdmin()`)
- `src/middleware.ts` - Route protection (redirects unauthenticated users)

### Server-First Architecture

This application uses **React Server Components (RSC)** as the default pattern with minimal client-side state.

**Data Flow:**
```
Server Component (page.tsx)
    ↓
Fetch data with Prisma (parallel with Promise.all)
    ↓
Pass data as props to Client Components
    ↓
Client Components handle interactivity only (forms, drag-drop, modals)
```

**Example Pattern:**
```typescript
// page.tsx - Server Component (default)
export default async function ContactsPage() {
  const { tenantId } = await getTenantContext();

  // Parallel data fetching on server
  const [contacts, customFields] = await Promise.all([
    prisma.contact.findMany({ where: { tenantId } }),
    prisma.customField.findMany({ where: { tenantId, objectType: 'contact' } })
  ]);

  // Pass to client component
  return <ContactsTable contacts={contacts} customFields={customFields} />;
}

// contacts-table.tsx - Client Component
"use client"
export function ContactsTable({ contacts, customFields }) {
  // Handles interactivity only
}
```

**No global state management** - No Redux, Zustand, or similar libraries. State managed through:
- Server state: React Server Components + Prisma queries
- Form state: React Hook Form
- UI state: Local `useState`
- Session state: NextAuth provider

### Authentication Flow

**NextAuth with Credentials Provider:**
```
1. User submits login → signIn("credentials", { email, password })
2. NextAuth calls authorize() → Query DB for user
3. bcrypt.compare(password, hash) → Validate password
4. Generate JWT: { userId, tenantId, role }
5. Set HTTP-only cookie
6. Redirect to /dashboard
```

**Session Structure:**
```typescript
session.user = {
  id: string,
  email: string,
  name: string,
  tenantId: string,  // ← Critical for tenant isolation
  role: "admin" | "member"
}
```

**Files:**
- `src/lib/auth.ts` - NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - Auth endpoints

### Server Actions Pattern (Primary Backend)

**Every mutation follows this pattern:**
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { getTenantContext } from "@/lib/db/tenant-context";
import { prisma } from "@/lib/prisma";

export async function createContactAction(data: ContactInput) {
  // 1. Extract tenant context (enforces isolation)
  const { tenantId, userId } = await getTenantContext();

  // 2. Validate input with Zod
  const validated = contactSchema.parse(data);

  // 3. Database operation (always scoped to tenantId)
  const contact = await prisma.contact.create({
    data: {
      ...validated,
      tenantId,      // ← Automatic tenant isolation
      ownerUserId: userId
    }
  });

  // 4. Invalidate Next.js cache
  revalidatePath("/contacts");

  return { success: true, contact };
}
```

**Key Points:**
- `"use server"` at top of file
- Always extract `tenantId` from session (never from user input)
- Include `tenantId` in all WHERE clauses
- Call `revalidatePath()` to invalidate cache after mutations

**All server actions:** `src/lib/actions/*`

## Critical Architectural Patterns

### 1. Custom Fields System

**Two-table polymorphic design:**

**CustomField** - Schema definition (admin creates):
```typescript
{
  objectType: "deal",       // Which entity type
  key: "industry",          // Field identifier
  label: "Industry",        // Display label
  fieldType: "select",      // text | number | date | select | textarea
  optionsJsonb: [...],      // For select dropdowns
  required: true,
  position: 0               // Display order
}
```

**CustomFieldValue** - Actual data (polymorphic):
```typescript
{
  objectType: "deal",
  objectId: "deal_abc123",  // Polymorphic foreign key
  customFieldId: "field_xyz",
  valueJsonb: "tech"        // JSONB - flexible type storage
}
```

**Dynamic rendering:** Forms query CustomField table and dynamically render inputs based on `fieldType`. Values saved with upsert pattern.

**Files:**
- `src/lib/actions/custom-field-actions.ts` - CRUD for custom fields
- `src/app/(dashboard)/settings/custom-fields/` - Admin UI

### 2. Role-Based Access Control

**Two Roles:**
- `admin` - Full access including settings
- `member` - CRUD on own data only

**Admin-only pattern:**
```typescript
export async function createCustomFieldAction(data) {
  const { tenantId } = await requireAdmin();  // ← Throws if role !== "admin"
  // ... admin-only logic
}
```

**Admin-only routes:**
- `/settings/custom-fields`
- `/settings/pipeline`
- `/settings/automation-templates`

### 3. One Pipeline Per Tenant (MVP)

- Each tenant gets one default "Sales Pipeline" on signup
- 6 default stages: Lead → Qualified → Proposal → Negotiation → Won/Lost
- Stages have `position` (ordering), `isWon`, `isLost` flags
- Design allows future expansion to multiple pipelines

**Signup creates in transaction:**
```typescript
await prisma.$transaction(async (tx) => {
  const tenant = await tx.tenant.create({ ... });
  const user = await tx.user.create({ role: "admin", ... });
  const pipeline = await tx.pipeline.create({
    stages: { create: [/* 6 stages */] }
  });
});
```

### 4. Automation Templates

Task completion can trigger automated follow-up messages:

**Flow:**
1. Admin creates `AutomationTemplate` in settings
2. User assigns template to a task
3. When task marked as "done" → trigger automation
4. Template variables replaced: `{contact_name}`, `{task_title}`, `{task_body}`
5. Message sent to contact email or custom email

**Files:**
- `src/lib/actions/automation-template-actions.ts` - Template CRUD
- `src/lib/actions/task-actions.ts` - Trigger logic in `updateTaskStatusAction()`

## Database Schema

### 11 Core Models

1. **Tenant** - Root entity (has name, slug)
2. **User** - Users with role (admin/member)
3. **Contact** - Customer/lead contacts
4. **Company** - Organizations
5. **Pipeline** - Sales pipeline
6. **Stage** - Pipeline stages with positioning
7. **Deal** - Sales opportunities
8. **Activity** - Tasks, notes, calls (polymorphic: dealId/contactId)
9. **CustomField** - Field definitions
10. **CustomFieldValue** - Field values (JSONB)
11. **AutomationTemplate** - Email automation templates

**Key Schema Features:**
- All models have `tenantId` foreign key (except Tenant)
- Cascade deletes on tenant deletion
- JSONB columns: `dataJsonb`, `optionsJsonb`, `valueJsonb`
- Money as integers: `valueCents` (avoids float precision issues)
- Composite unique constraints: `[tenantId, objectType, key]`
- Strategic indexes: `@@index([tenantId])`, `@@index([tenantId, stageId])`

**File:** `prisma/schema.prisma`

### Prisma Configuration

**Custom output path:**
```typescript
generator client {
  provider = "prisma-client"
  output   = "../src/lib/generated/client"  // Custom path (not node_modules)
}
```

**Connection pooling:**
```typescript
// src/lib/prisma.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

**Benefits:** Reduced connection overhead, better concurrency

### Seeding

**Creates demo data:**
- 1 demo tenant (slug: "demo")
- 1 admin user (demo@demo.com / demo123)
- 1 pipeline with 6 stages
- 10 contacts, 5 companies, 12 deals

**Pattern:** Uses `upsert()` for idempotency (safe to run multiple times)

**File:** `prisma/seed.ts`

## Tech Stack Specifics

### Next.js App Router Patterns

**Route Groups:**
```
src/app/
├── (auth)/              # Excludes dashboard layout
│   ├── login/
│   └── signup/
├── (dashboard)/         # Includes sidebar + header
│   ├── layout.tsx       # Dashboard layout
│   ├── dashboard/
│   ├── contacts/
│   ├── deals/
│   └── settings/
└── api/
    └── auth/[...nextauth]/  # NextAuth endpoints
```

**Middleware protection:**
- Protects all routes except `/login`, `/signup`, `/api/auth`, static files
- Redirects unauthenticated → `/login`

### React Server Components Guidelines

**Use Server Components for:**
- All `page.tsx` files (data fetching)
- Layout components
- Static UI components

**Use Client Components ("use client") for:**
- Forms (React Hook Form)
- Dialogs/modals with state
- Drag-and-drop (Kanban)
- Interactive dropdowns
- Toast notifications

**Example:**
```typescript
// Server Component
export default async function DealsPage() {
  const deals = await prisma.deal.findMany({ ... });
  return <DealsKanban deals={deals} />;  // Pass to client
}

// Client Component
"use client"
export function DealsKanban({ deals }) {
  const [optimisticDeals, setOptimisticDeals] = useState(deals);
  // ... interactive logic
}
```

### Cache Invalidation

**Use `revalidatePath()` after all mutations:**
```typescript
export async function createContactAction(data) {
  await prisma.contact.create({ data });

  revalidatePath("/contacts");  // ← Invalidates Next.js cache

  return { success: true };
}
```

**How it works:**
1. Mutation completes
2. Route marked as stale
3. Next visit fetches fresh data
4. No manual cache management needed

## Critical Patterns to Remember

### 1. Tenant Isolation (MANDATORY)
```typescript
// ✅ ALWAYS extract tenantId from session
const { tenantId } = await getTenantContext();
await prisma.contact.findMany({ where: { tenantId } });

// ❌ NEVER query without tenantId
await prisma.contact.findMany({});  // SECURITY ISSUE!
```

### 2. Parallel Data Fetching
```typescript
// ✅ FAST - Parallel
const [contacts, deals] = await Promise.all([
  prisma.contact.findMany({ where: { tenantId } }),
  prisma.deal.findMany({ where: { tenantId } })
]);

// ❌ SLOW - Sequential
const contacts = await prisma.contact.findMany({ where: { tenantId } });
const deals = await prisma.deal.findMany({ where: { tenantId } });
```

### 3. Admin-Only Actions
```typescript
// Use requireAdmin() not getTenantContext()
export async function createCustomFieldAction(data) {
  const { tenantId } = await requireAdmin();  // ← Throws if not admin
}
```

### 4. Money as Cents
```typescript
// Store as cents (integer)
valueCents: 5000  // Represents $50.00

// Display as dollars
const dollars = deal.valueCents / 100;
```

### 5. Server Actions Structure
```typescript
"use server";

// 1. Extract tenant context
const { tenantId } = await getTenantContext();

// 2. Validate with Zod
const validated = schema.parse(data);

// 3. Database operation
await prisma.model.create({ data: { ...validated, tenantId } });

// 4. Invalidate cache
revalidatePath("/route");

// 5. Return result
return { success: true };
```

## Environment Variables

```env
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db"
NEXTAUTH_SECRET="<generate-with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional - for automation emails)
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY="re_xxxxxxxxxxxxx"
# Optional: Custom from email (requires domain verification in Resend)
# EMAIL_FROM="CRM Notifications <noreply@yourdomain.com>"
```

### Email Automation Setup

The CRM includes email automation for:
- **Task completions**: Sends email when task marked as "done" (if automation template assigned)
- **Deal stage changes**: Sends email when deal moves to new stage (if stage has automations)

**Quick Setup:**
1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Get API key from dashboard
3. Add to `.env.local`: `RESEND_API_KEY="re_xxxxxxxxxxxxx"`
4. For testing, emails will come from `onboarding@resend.dev`
5. For production, verify your domain in Resend and set `EMAIL_FROM`

**Graceful Degradation:** If `RESEND_API_KEY` is not configured, automations will log warnings but won't crash. Task completions and deal moves will still succeed.

## Key File Locations

**Configuration:**
- `prisma/schema.prisma` - Database schema
- `src/lib/auth.ts` - NextAuth config
- `src/middleware.ts` - Route protection
- `docker-compose.yml` - PostgreSQL setup

**Core Logic:**
- `src/lib/db/tenant-context.ts` - Tenant isolation helpers
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/email.ts` - Email service (Resend integration)
- `src/lib/actions/*` - All server actions

**Documentation:**
- `README.md` - Quick start guide
- `ARCHITECTURE.md` - Detailed architecture docs
