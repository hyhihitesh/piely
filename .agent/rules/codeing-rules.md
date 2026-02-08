---
trigger: manual
---

# Piely Project Rules & Coding Standards

> **Critical**: This project uses a bleeding-edge stack (Next.js 15, React 19, Tailwind v4). Do NOT use legacy patterns. Always follow these rules.

## 1. Tech Stack (Locked)

- **Framework**: Next.js 15 (App Router)
- **UI Architecture**: React 19 (Server Components + Server Actions)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database/Auth**: Supabase (Postgres) via `@supabase/ssr`
- **AI**: Vercel AI SDK v6

---

## 2. Next.js 15 & React 19 Patterns

### Async Request APIs (STRICT)

Next.js 15 makes page/route props and request APIs asynchronous.

- **NEVER** access `params` or `searchParams` directly.
- **ALWAYS** `await` them first.

```tsx
// ✅ CORRECT
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div>{slug}</div>;
}

// ❌ WRONG
export default function Page({ params }: { params: { slug: string } }) {
  return <div>{params.slug}</div>;
}
```

### Async Headers & Cookies

- **ALWAYS** `await cookies()` and `await headers()`.

```tsx
// ✅ CORRECT
import { cookies } from 'next/headers';
const cookieStore = await cookies();
const token = cookieStore.get('token');

// ❌ WRONG
const token = cookies().get('token');
```

### Server Actions & Forms

- Use `useActionState` (React 19) instead of `useFormState` (deprecated).
- Action signatures must match the React 19 expectation (`prevState`, `formData`).

---

## 3. Tailwind CSS v4 Setup

- **Configuration**: Do NOT create a `tailwind.config.js` unless absolutely necessary for complex plugins.
- **Global CSS**: Use the new CSS-first configuration in `app/globals.css`:

  ```css
  @import "tailwindcss";
  
  @theme {
    --color-primary: #...;
    /* Define other variables here */
  }
  ```

- **Shadcn UI**: In `components.json`, ensure the strict structure:

  ```json
  "tailwind": {
    "config": "", 
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  }
  ```

---

## 4. Supabase & Data Fetching

### Server-Side (SSR)

- Use `createClient` from `@/utils/supabase/server`.
- **NEVER** cache the client instance globally.
- **ALWAYS** await cookies inside the client factory.

### Client-Side

- Use `createClient` from `@/utils/supabase/client`.
- Use the `useSupabase` hook (if we create one) or singleton pattern for client components.

### RLS Policies

- Every table MUST have RLS enabled.
- No public access unless explicitly required for `storage` buckets.

---

## 5. Vercel AI SDK v6

- Use `streamText` and `generateText` from `ai`.
- Prefer **Server Actions** for calling LLMs over API routes for cleaner type safety.
- Use `zod` for strictly typed tool calls / structured output.

## 6. General Coding Principles

- **"Chat thinks, Canvas remembers"**: Ensure all persistent state goes to the DB (Canvas), while ephemeral state stays in chat.
- **Type Safety**: Strictly typed TypeScript. No `any`.
- **File Structure**:
  - `app/` (routes)
  - `components/` (ui, feature-specific)
  - `lib/` (utils, db clients, types)
  - `actions/` (server actions)
