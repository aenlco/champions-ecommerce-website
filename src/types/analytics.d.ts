export {}

declare global {
    interface Window {
        dataLayer?: unknown[]
        gtag?: (...args: unknown[]) => void
        fbq?: (...args: unknown[]) => void
        ttq?: {
            track: (event: string, params?: Record<string, unknown>) => void
            load: (id: string) => void
            page: () => void
        }
        snaptr?: (...args: unknown[]) => void
    }
}
