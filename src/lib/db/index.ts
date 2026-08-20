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

const tenantCache = new Map<string, TenantType | undefined>()

export const getTenantByHostname = async (hostname: string) => {
    if (tenantCache.has(hostname)) {
        return tenantCache.get(hostname)
    }

    const tenant = await db.query.tenants.findFirst({ where: (t) => t.hostname === hostname })
    tenantCache.set(hostname, tenant)
    return tenant
}
