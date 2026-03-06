import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
    component: HomePage,
})

function HomePage() {
    const { tenantConfig } = useRouteContext({ from: "__root__" })
    return (
        <main>
            <section className="p-6 flex items-center gap-4">
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
                    <Link to="/settings" className="block max-w-max underline hover:text-blue-600">
                        Navigate to settings
                    </Link>
                </div>
            </section>
        </main>
    )
}
