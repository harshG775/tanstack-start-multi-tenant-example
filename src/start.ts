import { createStart, createCsrfMiddleware } from "@tanstack/react-start"
import { tenantMiddleware } from "./lib/server/tenant.middleware"

const csrfMiddleware = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" })

export const startInstance = createStart(() => {
    return { requestMiddleware: [csrfMiddleware, tenantMiddleware] }
})
