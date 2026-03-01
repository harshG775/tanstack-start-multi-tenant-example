# Multi-Tenancy in TanStack Start

Building a SaaS usually requires identifying a tenant by their **subdomain** or **hostname**. Here is how to handle this on the server using **TanStack Start**.

---

## 1. Normalize the Hostname

Create a utility to handle local development vs. production domains.

```ts
// lib/normalizeHostname.ts
export const normalizeHostname = (hostname: string): string => {
    if (hostname.includes("localhost")) {
        return hostname.replace(".localhost", "").replace(":3000", "")
    }
    return hostname
}

```

## 2. Identify the Tenant (Server Function)

Use `getRequestUrl` to detect the hostname during the SSR request.

```ts
// serverFn/tenant.serverFn.ts
import { getRequestUrl } from "@tanstack/react-start/server"
import { normalizeHostname } from "#/lib/normalizeHostname"
import { getTenantConfigByHostname } from "#/lib/api"

export const getTenantConfig = async () => {
    const url = getRequestUrl()
    const hostname = normalizeHostname(url.hostname)
    const tenantConfig = getTenantConfigByHostname({ hostname })

    if (!tenantConfig) throw new Response("Not Found", { status: 404 })

    return tenantConfig
}

```

## 3. Register in the Root Loader

Inject the tenant data into the `__root__` route so every page has access to it.

```tsx
// routes/__root.tsx
export const Route = createRootRoute({
    loader: async () => {
        try {
            const tenant = await getTenantConfig()
            return { tenant }
        } catch {
            return { tenant: null }
        }
    },
    // ...
})

```

## 4. Use the Data

Access the tenant in any component with `useLoaderData`.

```tsx
// routes/index.tsx
function HomePage() {
    const { tenant } = useLoaderData({ from: "__root__" })

    return (
        <main>
            <h1>Active Tenant: {tenant?.id}</h1>
            <pre>{JSON.stringify(tenant, null, 2)}</pre>
        </main>
    )
}

```
