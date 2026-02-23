/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_SQUARE_APP_ID: string
    readonly VITE_SQUARE_LOCATION_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// Square Web Payments SDK global types
declare namespace Square {
    interface Payments {
        card(): Promise<Card>
    }
    interface Card {
        attach(selector: string): Promise<void>
        tokenize(): Promise<TokenResult>
        destroy(): Promise<void>
    }
    interface TokenResult {
        status: 'OK' | 'ERROR'
        token?: string
        errors?: Array<{ message: string }>
    }
}

interface Window {
    Square?: {
        payments(appId: string, locationId: string): Promise<Square.Payments>
    }
}
