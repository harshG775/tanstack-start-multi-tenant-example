import { notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

export const getTenantFn = createServerFn({ method: "GET" }).handler(async ({ context }) => {
    if (!context.tenant) {
        throw notFound()
    }

    return context.tenant
})
