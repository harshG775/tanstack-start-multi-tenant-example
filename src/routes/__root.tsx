import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import appCss from "../styles.css?url"
import { getTenantFn } from "#/lib/server/tenant.function"

export const Route = createRootRoute({
    beforeLoad: async () => {
        const tenant = await getTenantFn()
        return { tenant }
    },
    head: ({ match }) => {
        const tenant = match.context.tenant

        const title = tenant.meta.name || "TanStack Start Starter"
        const description = tenant.meta.description || "A TanStack Start application"
        const favicon = tenant.meta.favicon || "/favicon.ico"
        const logo = tenant.meta.logo || "/logo.png"
        const url = `https://${tenant.hostname}${match.pathname}`

        return {
            meta: [
                {
                    charSet: "utf-8",
                },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    title,
                },
                {
                    name: "description",
                    content: description,
                },
                {
                    property: "og:title",
                    content: title,
                },
                {
                    property: "og:description",
                    content: description,
                },
                {
                    property: "og:image",
                    content: logo,
                },
                {
                    property: "og:url",
                    content: url,
                },
                {
                    name: "twitter:card",
                    content: "summary_large_image",
                },
                {
                    name: "twitter:title",
                    content: title,
                },
                {
                    name: "twitter:description",
                    content: description,
                },
                {
                    name: "twitter:image",
                    content: logo,
                },
                {
                    name: "twitter:url",
                    content: url,
                },
            ],
            links: [
                {
                    rel: "stylesheet",
                    href: appCss,
                },
                {
                    rel: "icon",
                    href: favicon,
                },
            ],
        }
    },
    shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className="font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]">
                {children}
                <TanStackDevtools
                    config={{
                        position: "bottom-right",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
                <Scripts />
            </body>
        </html>
    )
}
