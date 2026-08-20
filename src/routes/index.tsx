import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: App })

function App() {
    const { tenant } = Route.useRouteContext()

    return (
        <main className="page-wrap px-4 pb-8 pt-14">
            <div className="flex items-center gap-4">
                <img
                    src={tenant.meta.logo}
                    alt={tenant.meta.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                />
                <div>
                    <h1 className="text-2xl font-bold">{tenant.meta.name}</h1>
                    <p>{tenant.meta.description}</p>
                    <small className="text-muted-foreground">Hostname: {tenant.hostname}</small>
                </div>
            </div>
        </main>
    )
}
