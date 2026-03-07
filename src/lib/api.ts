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
const tenantsDB = [
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
let count = 0
export const getTenantConfigByHostname = ({ hostname }: { hostname: string }) => {
    console.log("<getTenantConfigByHostname> call count:", count++)
    return tenantsDB.find((tenant) => tenant.hostname === hostname) ?? null
}
