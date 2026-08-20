# TanStack Start Multi-Tenant Example

A **hostname-based multi-tenant application** built with **TanStack Start** and **React**. Demonstrates full-stack architecture for SaaS platforms serving multiple tenants from a single codebase.

## Key Features

- **Hostname-based Tenant Resolution** – tenants are identified from the request's `Host` header via global request middleware, before routing even happens
- **Cached Tenant Lookups** – resolved tenants are cached in memory (swappable for Redis) so repeated requests don't hit the "database" again
- **Server-Side Rendering (SSR)** – tenant configuration is resolved during the request lifecycle and injected into router context
- **Type-Safe** – full TypeScript support, including typed middleware context and router context
- **Dynamic SEO** – title, description, Open Graph tags, and favicon are generated per tenant

## Demo

**Tenant One**  
![Tenant 1](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ijod78slb3ceq7rmokwd.png)

**Tenant Two**  
![Tenant 2](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/diuxzwj9rx6twd3c6oyw.png)

## Tech Stack

- **[TanStack Start](https://tanstack.com/start/latest)** – full-stack framework with server functions & middleware
- **[TanStack Router](https://tanstack.com/router/latest)** – type-safe routing with context
- **React** – UI component framework
- **TypeScript** – type safety & developer experience
- **Vite** – lightning-fast build tool

## Architecture

```text
Request
  ↓
Global Request Middleware (tenantMiddleware)
  ↓ normalizeHostname(Host header)
  ↓ getTenantByHostname() — in-memory cached lookup
  ↓
Root Route beforeLoad → getTenantFn()  (404s if no tenant matches)
  ↓
Router Context { tenant }
  ↓
Dynamic head() → SEO meta, Open Graph, favicon
  ↓
Hydrated App (Route.useRouteContext())
```

Each tenant receives isolated branding, metadata, logo, and favicon.

## Quick Start

```bash
pnpm install
pnpm dev
```

Visit `tenant-1.com.localhost:5000` and `tenant-2.com.localhost:5000` to see different tenant branding.

## Skills Demonstrated

✓ Full-Stack Development (Server + Client)  
✓ Multi-Tenant Architecture  
✓ Request & Server Function Middleware  
✓ Server Functions & SSR  
✓ Type-Safe Router Context  
✓ Dynamic, Per-Tenant SEO

---

# Tutorial: Hostname-Based Multi-Tenancy

> This tutorial assumes `@tanstack/react-start` v1.170+.

In many SaaS applications, a **single codebase serves multiple tenants**. Each tenant may have its own branding, metadata, and configuration. This tutorial builds a hostname-based multi-tenant app step by step, using TanStack Start's request middleware, server functions, and router context.

The goal: identify the tenant from the incoming request's hostname, resolve it once per request, and make it available everywhere the app needs it — route metadata, page content, and (eventually) tenant-scoped server functions.

## What We'll Build

Two tenants served from the same application:

```text
tenant-1.com → Tenant One branding
tenant-2.com → Tenant Two branding
```

Each tenant has a custom name, description, logo, and favicon — all resolved automatically during the request lifecycle.

## Project Structure

```text
src
├─ lib
│  ├─ db
│  │  └─ index.ts              # fake in-memory "drizzle-style" db + cached tenant lookup
│  └─ server
│     ├─ tenant.middleware.ts  # request middleware: Host header → tenant
│     └─ tenant.function.ts    # server function: read resolved tenant, 404 if missing
├─ routes
│  ├─ __root.tsx                # beforeLoad + dynamic head/SEO
│  └─ index.tsx                 # displays the resolved tenant
├─ router.tsx                   # router-level defaultNotFoundComponent
└─ start.ts                     # registers global middleware (CSRF + tenant)
```

## Step 1: A Fake Database with a Drizzle-Style Query API

Rather than wiring up a real database for this example, `src/lib/db/index.ts` simulates one with the same shape as Drizzle's `db.query.<table>.findFirst/findMany` API — so swapping in a real Drizzle setup later is a drop-in replacement, not a rewrite.

```ts
export type TenantType = {
    id: string
    hostname: string
    meta: {
        name: string
        description: string
        logo: string
        favicon: string
    }
}

export const tenants: TenantType[] = [
    {
        id: "tenant-1",
        hostname: "tenant-1.com",
        meta: {
            name: "Tenant One",
            description: "Tenant One is a modern SaaS platform.",
            logo: "https://picsum.photos/seed/tenant1/200/200",
            favicon: "https://picsum.photos/seed/tenant1/32/32",
        },
    },
    {
        id: "tenant-2",
        hostname: "tenant-2.com",
        meta: {
            name: "Tenant Two",
            description: "Tenant Two helps businesses scale fast.",
            logo: "https://picsum.photos/seed/tenant2/200/200",
            favicon: "https://picsum.photos/seed/tenant2/32/32",
        },
    },
]

type Where<T> = (row: T) => boolean

function createTable<T>(rows: T[]) {
    return {
        findFirst: async (options?: { where?: Where<T> }) => rows.find(options?.where ?? (() => true)),
        findMany: async (options?: { where?: Where<T>; limit?: number }) => {
            const matches = rows.filter(options?.where ?? (() => true))
            return options?.limit === undefined ? matches : matches.slice(0, options.limit)
        },
    }
}

// Fake in-memory db that mimics drizzle's db.query.<table>.findFirst/findMany API
export const db = {
    query: {
        tenants: createTable(tenants),
    },
}
```

Adding another mock table later is a one-liner: `db.query.users = createTable(users)`.

### Cache the lookup

A real tenant lookup would hit a database on every request. We cache it in-memory here (swap the `Map` for Redis in production, behind the same function signature):

```ts
// In-memory cache for the POC — swap for Redis (or similar) in production.
const tenantCache = new Map<string, TenantType | undefined>()

export const getTenantByHostname = async (hostname: string) => {
    if (tenantCache.has(hostname)) {
        return tenantCache.get(hostname)
    }

    const tenant = await db.query.tenants.findFirst({ where: (tenant) => tenant.hostname === hostname })
    tenantCache.set(hostname, tenant)
    return tenant
}
```

Caching a miss (`undefined`) too means an unknown hostname doesn't repeatedly hit the "database" either.

## Step 2: Resolve the Tenant in Request Middleware

TanStack Start's **request middleware** runs on every server request — SSR page loads, server routes, and server functions alike — before anything else. That makes it the right place to resolve the tenant from the `Host` header once, rather than re-deriving it in every route or server function that needs it.

`src/lib/server/tenant.middleware.ts`

```ts
import { createMiddleware } from "@tanstack/react-start"
import { getTenantByHostname } from "../db"

const normalizeHostname = (hostname: string | null): string => {
    if (!hostname) {
        return ""
    }

    let finalHostname = hostname

    // Development handling (e.g., tenant-1.com.localhost:3000)
    if (hostname.includes("localhost")) {
        const cleaned = hostname.replace(".localhost", "").replace(/:\d+$/, "")
        finalHostname = cleaned
    }

    return finalHostname
}

export const tenantMiddleware = createMiddleware({ type: "request" }).server(async ({ request, next }) => {
    const hostname = normalizeHostname(request.headers.get("host"))

    const tenant = await getTenantByHostname(hostname)
    return next({
        context: { tenant },
    })
})
```

## Step 3: Register the Middleware Globally

`src/start.ts` configures middleware that runs for **every** request in the app.

```ts
import { createStart, createCsrfMiddleware } from "@tanstack/react-start"
import { tenantMiddleware } from "./lib/server/tenant.middleware"

const csrfMiddleware = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" })

export const startInstance = createStart(() => {
    return { requestMiddleware: [csrfMiddleware, tenantMiddleware] }
})
```

Registering `tenantMiddleware` globally (rather than attaching it per-route) means `context.tenant` is available inside **any** server function automatically — not just the ones that load a page. That matters the moment you add a mutation or an unrelated RPC that needs to scope a read or write to the current tenant: it gets `context.tenant` for free, the same way you'd expect an `authMiddleware` to resolve the current user for every handler that needs it.

## Step 4: A Server Function to Read the Resolved Tenant

`src/lib/server/tenant.function.ts` reads the tenant that `tenantMiddleware` already resolved, and turns "no tenant" into a proper 404 instead of letting `undefined` leak into the UI.

```ts
import { notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

export const getTenantFn = createServerFn({ method: "GET" }).handler(async ({ context }) => {
    if (!context.tenant) {
        throw notFound()
    }

    return context.tenant
})
```

`context.tenant` is typed here purely because `tenantMiddleware` is registered globally in `start.ts` — no need to re-attach it via `.middleware([tenantMiddleware])` on every function that reads it.

> Prefer redirecting unknown hostnames to an onboarding flow instead of a 404? Swap the `throw notFound()` for `throw redirect({ href: "https://onboard.yourapp.com?redirect=" + encodeURIComponent(url.href) })`.

## Step 5: Resolve the Tenant Once, at the Root Route

`src/routes/__root.tsx` calls `getTenantFn()` in `beforeLoad`, once per navigation — not on every server-fn call — and puts the result into router context for every child route to use.

```tsx
export const Route = createRootRoute({
    beforeLoad: async () => {
        const tenant = await getTenantFn()
        return { tenant }
    },
    head: ({ match }) => {
        const tenant = match.context.tenant

        const title = tenant.meta.name || "TanStack Start Starter"
        const description = tenant.meta.description || "A TanStack Start application"
        const favicon = tenant.meta.favicon || "/favicon.ico"
        const logo = tenant.meta.logo || "/logo.png"

        return {
            meta: [
                { charSet: "utf-8" },
                { name: "viewport", content: "width=device-width, initial-scale=1" },
                { title },
                { name: "description", content: description },
                { property: "og:title", content: title },
                { property: "og:description", content: description },
                { property: "og:image", content: logo },
                { name: "twitter:card", content: "summary_large_image" },
            ],
            links: [
                { rel: "stylesheet", href: appCss },
                { rel: "icon", href: favicon },
            ],
        }
    },
    shellComponent: RootDocument,
})
```

`tenant` is guaranteed non-`undefined` here — `getTenantFn` already threw a 404 for a missing tenant before `beforeLoad` could return one. The `||` fallbacks instead guard against a tenant *record* with a blank field.

## Step 6: A Friendly Router-Wide Not Found Page

Since the 404 is thrown from the **root** route's `beforeLoad` rather than a specific leaf route, configure a router-level fallback in `src/router.tsx` instead of a per-route `notFoundComponent`:

```tsx
export function getRouter() {
    const router = createTanStackRouter({
        routeTree,
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        defaultNotFoundComponent: () => (
            <div className="flex min-h-screen items-center justify-center p-6 text-3xl font-semibold">
                Page not found.
            </div>
        ),
    })

    return router
}
```

## Step 7: Access the Tenant in a Route

Any descendant of the root route can read `tenant` back out of context with `Route.useRouteContext()` — no prop drilling, no extra fetch.

`src/routes/index.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: App })

function App() {
    const { tenant } = Route.useRouteContext()

    return (
        <main className="page-wrap px-4 pb-8 pt-14">
            <div className="flex items-center gap-4">
                <img src={tenant.meta.logo} alt={tenant.meta.name} width={64} height={64} className="rounded-full" />
                <div>
                    <h1 className="text-2xl font-bold">{tenant.meta.name}</h1>
                    <p>{tenant.meta.description}</p>
                    <small className="text-muted-foreground">Hostname: {tenant.hostname}</small>
                </div>
            </div>
        </main>
    )
}
```

## Result

The same application now serves different tenants depending on the hostname:

```text
tenant-1.com → Tenant One
tenant-2.com → Tenant Two
```

Each tenant receives its own metadata, branding, and configuration — all resolved once per request, before the page ever renders.

## Production Considerations

- **Caching:** swap the in-memory `Map` in `getTenantByHostname` for Redis (or similar) once tenants are backed by a real database — the function signature stays the same.
- **Validation:** ensure tenants are active and not suspended before returning their configuration.
- **Assets:** use absolute URLs or correctly prefixed CDN paths for cross-domain asset loading (logos, favicons).
- **Security:** avoid exposing internal tenant configuration fields to the client; only return what the UI actually needs.
- **Unknown hostnames:** decide once whether an unmatched domain should 404 or redirect to an onboarding/marketing page, and apply it consistently in `tenant.function.ts`.
