import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { getTenantConfig } from "./serverFn/tenant.serverFn"

export async function getRouter() {
    const tenantConfig = await getTenantConfig()

    const router = createTanStackRouter({
        routeTree,

        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        context: {
            tenantConfig: tenantConfig,
        },
    })

    return router
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
