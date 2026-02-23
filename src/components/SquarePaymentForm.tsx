import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { getSquarePayments } from '@/lib/square'

export interface SquarePaymentFormHandle {
    tokenize: () => Promise<string | null>
}

interface SquarePaymentFormProps {
    disabled?: boolean
}

const SquarePaymentForm = forwardRef<SquarePaymentFormHandle, SquarePaymentFormProps>(
    ({ disabled }, ref) => {
        const cardRef = useRef<Square.Card | null>(null)
        const [ready, setReady] = useState(false)
        const [error, setError] = useState<string | null>(null)

        useEffect(() => {
            let card: Square.Card | null = null

            async function init() {
                try {
                    const payments = await getSquarePayments()
                    card = await payments.card()
                    await card.attach('#sq-card-container')
                    cardRef.current = card
                    setReady(true)
                } catch (err: any) {
                    setError(err.message || 'Failed to load payment form')
                }
            }

            init()

            return () => {
                if (card) {
                    card.destroy().catch(() => {})
                }
            }
        }, [])

        useImperativeHandle(ref, () => ({
            tokenize: async () => {
                if (!cardRef.current) return null
                const result = await cardRef.current.tokenize()
                if (result.status === 'OK' && result.token) {
                    return result.token
                }
                const msg = result.errors?.map(e => e.message).join(', ') || 'Payment failed'
                throw new Error(msg)
            },
        }))

        if (error) {
            return (
                <div style={{
                    padding: '1.25rem',
                    border: '1px solid rgba(220,38,38,0.2)',
                    backgroundColor: 'rgba(220,38,38,0.04)',
                }}>
                    <p style={{ fontSize: '0.6875rem', color: '#dc2626', letterSpacing: '0.05em' }}>
                        {error}
                    </p>
                </div>
            )
        }

        return (
            <div style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
                <div
                    id="sq-card-container"
                    style={{
                        minHeight: '89px',
                        border: ready ? 'none' : '1px solid rgba(0,0,0,0.08)',
                    }}
                />
                {!ready && (
                    <p style={{
                        fontSize: '0.625rem',
                        letterSpacing: '0.15em',
                        color: 'var(--color-gray-400)',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        marginTop: '0.5rem',
                    }}>
                        Loading payment form...
                    </p>
                )}
            </div>
        )
    }
)

SquarePaymentForm.displayName = 'SquarePaymentForm'

export default SquarePaymentForm
