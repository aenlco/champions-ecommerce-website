let paymentsInstance: Square.Payments | null = null

export async function getSquarePayments(): Promise<Square.Payments> {
    if (paymentsInstance) return paymentsInstance

    if (!window.Square) {
        throw new Error('Square SDK not loaded. Check the script tag in index.html.')
    }

    const appId = import.meta.env.VITE_SQUARE_APP_ID
    const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID

    paymentsInstance = await window.Square.payments(appId, locationId)
    return paymentsInstance
}
