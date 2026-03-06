import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/settings")({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <div>Hello "/settings"!</div>
            <Link to="/" className="block max-w-max underline hover:text-blue-600">
                Navigate to Home
            </Link>
        </div>
    )
}
