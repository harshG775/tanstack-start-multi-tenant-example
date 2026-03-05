import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"
import { getTenantConfig } from "#/serverFn/tenant.serverFn"

export const Route = createRootRoute({
    staleTime: Infinity , //to stop fetching the getTenantConfig again on route navigation
    loader: async () => {
        try {
            const tenantConfig = await getTenantConfig()
            return { tenantConfig }
        } catch (error) {
            if (error instanceof Response && error.status === 404) {
                return { tenantConfig: null }
            }
            throw error
        }
    },
    head: (ctx) => {
        const tenantConfig = ctx.loaderData?.tenantConfig

        const title = tenantConfig?.meta.name ?? "TanStack Start Starter"
        const description = tenantConfig?.meta.description ?? "Default app description"
        const favicon = tenantConfig?.meta.favicon ?? "/favicon.ico"
        const image = tenantConfig?.meta.logo

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
