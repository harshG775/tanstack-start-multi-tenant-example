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
