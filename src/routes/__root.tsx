import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"
import { getTenantConfig } from "#/serverFn/tenant.serverFn"

export const Route = createRootRoute({
    loader: async () => {
        try {
            const tenant = await getTenantConfig()
            return { tenant: tenant }
        } catch (error) {
            return { tenant: null }
        }
    },
    head: (ctx) => {
        const tenant = ctx.loaderData?.tenant

        const title = tenant?.meta.name ?? "TanStack Start Starter"
        const description = tenant?.meta.description ?? "Default app description"
        const favicon = tenant?.meta.favicon ?? "/favicon.ico"
        const image = tenant?.meta.logo

        return {
            meta: [
                { charSet: "utf-8" },
                { name: "viewport", content: "width=device-width, initial-scale=1" },
                { title },
                { name: "description", content: description },

                // Open Graph
                { property: "og:title", content: title },
                { property: "og:description", content: description },
                { property: "og:image", content: image },

                // Twitter
                { name: "twitter:card", content: "summary_large_image" },
            ],
            links: [
                { rel: "stylesheet", href: appCss },
                { rel: "icon", href: favicon },
            ],
        }
    },
    shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body className="font-sans antialiased">
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
