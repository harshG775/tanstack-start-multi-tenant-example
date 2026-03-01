
# TanStack Start Multi-Tenant Starter

This is a specialized TanStack Start project configured for **Multi-Tenancy** based on hostnames and subdomains.

## Getting Started

To run this application locally:

```bash
pnpm install
pnpm dev

```

### Local Development Tip

To test multi-tenancy locally, you can use subdomains on `localhost`.

* `tenant-1.localhost:3000`
* `tenant-2.localhost:3000`

The project includes a `normalizeHostname` utility to handle these local URLs and map them to the correct tenant configuration.

---

## Multi-Tenancy Architecture

This project uses a "Server-First" approach to tenant identification.

### 1. Tenant Resolution

Identification happens in `src/serverFn/tenant.serverFn.ts`. It uses `@tanstack/react-start/server` to grab the request URL and find the matching tenant in your database/API.

### 2. Global State via Root Loader

The tenant configuration is fetched in the `__root.tsx` loader. This ensures that:

* Every route has access to the `tenantConfig` object.
* The UI can adapt (branding, features, etc.) before the page renders.
* 404s are thrown immediately if a tenant doesn't exist.

### 3. Accessing Tenant Data

You can access the active tenantConfig in any component using the `useLoaderData` hook:

```tsx
const { tenantConfig } = useLoaderData({ from: "__root__" })
```

---

## Project Structure

* `src/lib/normalizeHostname.ts`: Logic to strip ports and `localhost` for consistent tenant lookups.
* `src/serverFn/tenant.serverFn.ts`: Server-side logic to identify the tenant from the request.
* `src/routes/__root.tsx`: The main layout that bootstraps the tenant context.

---

## Server Functions

Server functions allow you to write server-side code that seamlessly integrates with your client components. In this project, they are used to securely access request headers and database configs.

```tsx
import { getTenantConfig } from "#/serverFn/tenant.serverFn"

// Used in loaders to resolve tenant-specific data
const tenantConfig = await getTenantConfig()

```

---

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing.

### Adding A Route

Add a new file in `./src/routes`. TanStack will automatically generate the route tree. To navigate between tenant pages, use the `Link` component:

```tsx
import { Link } from "@tanstack/react-router"

<Link to="/settings">Tenant Settings</Link>

```

---

## Styling

This project uses **Tailwind CSS**. Global styles are located in `src/styles.css`.

> **Tip:** You can use the `tenantConfig` object from the root loader to dynamically apply Tailwind classes for tenant-specific branding (e.g., `<body className={tenant.themeColor}>`).

---

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts development server |
| `pnpm build` | Builds for production |
| `pnpm test` | Runs Vitest suite |
| `pnpm lint` | Lints code using ESLint |
| `pnpm format` | Formats code with Prettier |

---

## Learn More

* [TanStack Start Docs](https://tanstack.com/start)
* [TanStack Router Docs](https://tanstack.com/router)