import { createFileRoute, useLoaderData } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: HomePage,
})

function HomePage() {
    const { tenant } = useLoaderData({ from: "__root__" })

    return (
        <main className="p-6">
            <h1 className="text-xl font-bold">Active Tenant</h1>
            <pre className="mt-4 bg-gray-100 p-4 rounded">{JSON.stringify(tenant, null, 2)}</pre>
        </main>
    )
}
