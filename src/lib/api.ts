type TenantConfig = {
    id: string
    hostname: string
}

const tenants: TenantConfig[] = [
    {
        id: "tenant-1",
        hostname: "tenant-1.com",
    },
    {
        id: "tenant-2",
        hostname: "tenant-2.com",
    },
]

export const getTenantConfigByHostname = ({ hostname }: { hostname: string }) => {
    return tenants.find((tenant) => tenant.hostname === hostname) ?? null
}
