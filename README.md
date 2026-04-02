# TanStack Start Multi-Tenant Example

A production-ready, **hostname-based multi-tenant application** built with **TanStack Start** and **React**. Demonstrates full-stack architecture for SaaS platforms serving multiple tenants from a single codebase.

## Key Features

- **Hostname-based Tenant Resolution** – Automatically identify tenants from request hostname
- **Server-Side Rendering (SSR)** – Tenant configuration loaded during request lifecycle
- **Type-Safe** – Full TypeScript support with router context typing
- **Scalable Architecture** – Tenant data injected into router context before hydration

## Demo

**Tenant One**  
![Tenant 1](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ijod78slb3ceq7rmokwd.png)

**Tenant Two**  
![Tenant 2](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/diuxzwj9rx6twd3c6oyw.png)

##  Tech Stack

- **[TanStack Start](https://tanstack.com/router/latest)** – Full-stack framework with server functions
- **[TanStack Router](https://tanstack.com/router/latest)** – Type-safe routing with context
- **React** – UI component framework
- **TypeScript** – Type safety & developer experience
- **Vite** – Lightning-fast build tool

## Architecture

```
Request → Hostname Resolution → Tenant Lookup → Router Context → SSR → Hydrated App
```

Each tenant receives isolated:
- Branding & metadata
- Logo & favicon
- Configuration

## Quick Start

```bash
pnpm install
pnpm dev
```

Visit `tenant-1.com.localhost:3000` and `tenant-2.com.localhost:3000` to see different tenant branding.

## Learn More

See [TUTORIAL.md](./TUTORIAL.md) for complete implementation guide.

## Skills Demonstrated

✓ Full-Stack Development (Server + Client)  
✓ Multi-Tenant Architecture  
✓ Server Functions & SSR  
✓ Type-Safe Router Context  
✓ Express-like Request Handling  
