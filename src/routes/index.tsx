import { createFileRoute, useLoaderData } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: HomePage,
})

function HomePage() {
    const { tenantConfig } = useLoaderData({ from: "__root__" })

    if (!tenantConfig) {
        return (
            <main className="p-6">
                <h1>No Tenant Found</h1>
                <p>This domain is not configured.</p>
            </main>
        )
    }

    return (
        <main className="p-6 flex items-center gap-4">
            <img
                src={tenantConfig.meta.logo}
                alt={tenantConfig.meta.name}
                width={100}
                height={100}
                style={{ borderRadius: "50%" }}
            />

            <div>
                <h1>Welcome to {tenantConfig.meta.name}</h1>
                <p>{tenantConfig.meta.description}</p>

                <small>Hostname: {tenantConfig.hostname}</small>
            </div>
        </main>
    )
}
