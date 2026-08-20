// A generic, in-memory, time-limited cache — a Map that forgets entries after a TTL.
export type Cache<T> = {
    has: (key: string) => boolean
    get: (key: string) => T | undefined
    set: (key: string, value: T) => void
}

export function createCache<T>(ttlMs: number): Cache<T> {
    type Entry = { value: T; expiresAt: number }

    const store = new Map<string, Entry>()

    const isExpired = (entry: Entry) => entry.expiresAt <= Date.now()

    return {
        has: (key) => {
            const entry = store.get(key)
            return entry !== undefined && !isExpired(entry)
        },
        get: (key) => {
            const entry = store.get(key)
            if (!entry || isExpired(entry)) {
                return undefined
            }
            return entry.value
        },
        set: (key, value) => {
            store.set(key, { value, expiresAt: Date.now() + ttlMs })
        },
    }
}
