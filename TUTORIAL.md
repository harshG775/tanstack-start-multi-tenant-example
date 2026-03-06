---
title: "Hostname-Based Multi-Tenancy"
description: "Learn how to structure a hostname-based multi-tenant app using TanStack Start with React."
---

> This tutorial assumes @tanstack/react-router: v1.132+.

Multi-tenant applications often need to resolve a tenant from the incoming hostname or subdomain during SSR (Server-Side Rendering). This guide demonstrates how to implement hostname-based multi-tenancy using TanStack Start.

---

## Architecture Overview

This guide demonstrates:

- Hostname-based tenant resolution
- SSR tenant detection
- Root-level data hydration
- Dynamic metadata handling

Request lifecycle:

```txt
Request
  -> Nitro Runtime
  -> getRequestUrl()
  -> normalizeHostname()
  -> getTenantConfigByHostname()
  -> Root Route Context
  -> Hydrated Application
```

---

## Full Source Code

View the complete repository on GitHub:

[https://github.com/harshG775/tanstack-start-multi-tenant-example](https://github.com/harshG775/tanstack-start-multi-tenant-example)

---

## 1. Normalize the Hostname

In production, you may have `tenant.com` or `user.saas.com`. In development, you typically use `localhost:3000`. This utility keeps behavior consistent across environments.

```ts
// lib/normalizeHostname.ts
export const normalizeHostname = (hostname: string): string => {
    // Handle local development subdomains like tenant.localhost:3000
    if (hostname.includes("localhost")) {
        return hostname.replace(".localhost", "").split(":")[0]
    }
    return hostname
}
```

---

## 2. Identify the Tenant (Server Function)

Use `createServerFn` to ensure tenant resolution never reaches the client. `getRequestUrl()` retrieves the incoming request during SSR.

```ts
// serverFn/tenant.serverFn.ts
import { getTenantConfigByHostname } from "#/lib/api"
import { normalizeHostname } from "#/lib/normalizeHostname"
import { createServerFn } from "@tanstack/react-start"
import { getRequestUrl } from "@tanstack/react-start/server"

export const getTenantConfig = createServerFn().handler(async () => {
    const url = getRequestUrl()
    const hostname = normalizeHostname(url.hostname)

    const tenantConfig = await getTenantConfigByHostname({ hostname })

    if (!tenantConfig) {
        throw new Response("Tenant Not Found", { status: 404 })
    }

    return tenantConfig
})
```

---

## 3. Resolve Tenant in Router Context

Resolve the tenant configuration during router creation and attach it to the router context. This makes the tenant data available to all routes, loaders, and components without relying on root loader data.

Using router context keeps tenant resolution part of the request lifecycle and avoids coupling core application state to route loaders.

```tsx
// src/router.tsx
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { getTenantConfig } from "./serverFn/tenant.serverFn"

export async function getRouter() {
    const tenantConfig = await getTenantConfig() // <-

    const router = createTanStackRouter({
        routeTree,

        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        context: {
            tenantConfig: tenantConfig, // <-
        },
    })

    return router
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
```

---

## 4. Dynamic Metadata

Tenant data can be used to dynamically update metadata for SEO.

```tsx
// routes/__root.tsx
export const Route = createRootRoute({
    head: ({ match }) => {
        const tenantConfig = match.context.tenantConfig

        return {
            meta: [
                { title: tenant?.meta.name ?? "Default App" },
                { name: "description", content: tenant?.meta.description },
                { property: "og:image", content: tenant?.meta.logo },
            ],
            links: [{ rel: "icon", href: tenant?.meta.favicon ?? "/favicon.ico" }],
        }
    },
})
```

---

## 5. Using Tenant Data in Components

Access root loader data using `useLoaderData`.

```tsx
// routes/index.tsx
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: HomePage,
})

function HomePage() {
    const { tenantConfig } = useRouteContext({ from: "__root__" })
    return (
        <main className="p-6 flex items-center gap-4">
            <img
                src={tenantConfig.meta.logo}
                alt={tenantConfig.meta.name}
                width={100}
                height={100}
                style={{ borderRadius: "50%" }}
            />

            <div>
                <h1>Welcome to {tenantConfig.meta.name}</h1>
                <p>{tenantConfig.meta.description}</p>

                <small>Hostname: {tenantConfig.hostname}</small>
            </div>
        </main>
    )
}
```

---

## Production Considerations

- **Caching:** Cache `getTenantConfigByHostname` (e.g., Redis or in-memory cache) to avoid repeated database lookups.
- **Validation:** Ensure tenants are active and not suspended before returning configuration.
- **Assets:** Use absolute URLs or correctly prefixed CDN paths for cross-domain asset loading.
- **Security:** Avoid exposing internal tenant configuration fields to the client.

---

This approach provides a clean, SSR-first architecture for hostname-based multi-tenancy in TanStack Start while keeping sensitive logic server-only.
