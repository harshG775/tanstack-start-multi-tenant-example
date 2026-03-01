import { createFileRoute, useLoaderData } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: HomePage,
})

function HomePage() {
    const { tenant } = useLoaderData({ from: "__root__" })

    if (!tenant) {
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
                src={tenant.meta.logo}
                alt={tenant.meta.name}
                width={100}
                height={100}
                style={{ borderRadius: "50%" }}
            />

            <div>
                <h1>Welcome to {tenant.meta.name}</h1>
                <p>{tenant.meta.description}</p>

                <small>Hostname: {tenant.hostname}</small>
            </div>
        </main>
    )
}
