import { getTenantConfigByHostname } from "#/lib/api"
import { normalizeHostname } from "#/lib/normalizeHostname"
import { createServerOnlyFn } from "@tanstack/react-start"
import { getRequestUrl } from "@tanstack/react-start/server"

export const getTenantConfig = createServerOnlyFn(async () => {
    const url = getRequestUrl()

    const hostname = normalizeHostname(url.hostname)

    const tenantConfig = getTenantConfigByHostname({ hostname })

    if (!tenantConfig) {
        throw new Response("Tenant Not Found", { status: 404 })
    }

    return tenantConfig
})
