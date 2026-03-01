export const normalizeHostname = (hostname: string): string => {
    let finalHostname = hostname

    // Development handling (e.g., tenant-1.com.localhost:3000)
    if (hostname.includes("localhost")) {
        const cleaned = hostname.replace(".localhost", "").replace(":3000", "")
        finalHostname = cleaned
    }

    return finalHostname
}
