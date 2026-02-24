import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import SquarePaymentForm from '@/components/SquarePaymentForm'
import type { SquarePaymentFormHandle } from '@/components/SquarePaymentForm'

export default function Checkout() {
    const navigate = useNavigate()
    const { items, subtotal, clearCart } = useCart()
    const { user } = useAuth()
    const paymentFormRef = useRef<SquarePaymentFormHandle>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState({
        email: user?.email || '',
        phone: '',
        full_name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
    })

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (items.length === 0 || !paymentFormRef.current) return

        setLoading(true)
        setError(null)

        try {
            const token = await paymentFormRef.current.tokenize()
            if (!token) throw new Error('Failed to tokenize card')

            const payload = {
                source_id: token,
                items: items.map(item => ({
                    product_id: item.product.id,
                    product_name: item.product.name,
                    variant_id: item.variant.id,
                    size: item.variant.size,
                    color: item.variant.color,
                    unit_price: item.customPrice ?? item.product.price,
                    quantity: item.quantity,
                })),
                amount: subtotal,
                shipping_address: {
                    full_name: form.full_name,
                    line1: form.line1,
                    line2: form.line2,
                    city: form.city,
                    state: form.state,
                    postal_code: form.postal_code,
                    country: form.country,
                },
                email: form.email,
                user_id: user?.id ?? null,
            }

            const { data, error: fnError } = await supabase.functions.invoke(
                'create-square-payment',
                { body: payload }
            )

            if (fnError) throw fnError

            clearCart()
            navigate(`/order-success?payment_id=${data.payment_id}`)
        } catch (err: any) {
            console.error('Checkout error:', err)
            setError(err.message || 'Payment failed. Please try again.')
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <PageTransition>
                <div
                    style={{
                        paddingTop: '100px',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1.5rem',
                    }}
                >
                    <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                        Your bag is empty
                    </p>
                    <a
                        href="/shop"
                        style={{
                            fontSize: '0.625rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                        }}
                    >
                        Continue Shopping
                    </a>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
                <h1
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        maxWidth: '1100px',
                        margin: '0 auto',
                        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 0',
                    }}
                >
                    Checkout
                </h1>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        maxWidth: '1100px',
                        margin: '0 auto',
                        padding: 'clamp(1.5rem, 4vw, 3rem)',
                        gap: '3rem',
                    }}
                    className="md:grid-cols-[1.2fr_1fr]"
                >
                    {/* Left: Shipping Form */}
                    <div>
                        {error && (
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(220,38,38,0.2)',
                                    backgroundColor: 'rgba(220,38,38,0.04)',
                                }}
                            >
                                <p style={{ fontSize: '0.6875rem', color: '#dc2626', letterSpacing: '0.05em' }}>
                                    {error}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Contact */}
                            <div style={{ marginBottom: '2rem' }}>
                                <p className="text-label" style={{ marginBottom: '1rem', color: 'var(--color-gray-500)' }}>
                                    Contact
                                </p>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Shipping */}
                            <div style={{ marginBottom: '2rem' }}>
                                <p className="text-label" style={{ marginBottom: '1rem', color: 'var(--color-gray-500)' }}>
                                    Shipping Address
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required />
                                    <input name="line1" placeholder="Address Line 1" value={form.line1} onChange={handleChange} required />
                                    <input name="line2" placeholder="Address Line 2 (optional)" value={form.line2} onChange={handleChange} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
                                        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <input name="postal_code" placeholder="Zip Code" value={form.postal_code} onChange={handleChange} required />
                                        <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            {/* Payment — Square */}
                            <div style={{ marginBottom: '2rem' }}>
                                <p className="text-label" style={{ marginBottom: '1rem', color: 'var(--color-gray-500)' }}>
                                    Payment
                                </p>
                                <SquarePaymentForm ref={paymentFormRef} disabled={loading} />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-black)',
                                    color: 'var(--color-white)',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? 'wait' : 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {loading ? 'PROCESSING PAYMENT...' : `PAY ${formatPrice(subtotal)}`}
                            </button>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div
                        style={{
                            backgroundColor: 'var(--color-gray-50)',
                            padding: '2rem',
                            alignSelf: 'start',
                            position: 'sticky',
                            top: '80px',
                        }}
                    >
                        <p
                            className="text-label"
                            style={{ marginBottom: '1.5rem', color: 'var(--color-gray-500)' }}
                        >
                            Order Summary
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {items.map(item => (
                                <div
                                    key={item.variant.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        paddingBottom: '1rem',
                                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>{item.product.name}</p>
                                        <p style={{ fontSize: '0.5625rem', color: 'var(--color-gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.125rem' }}>
                                            {item.variant.size} / {item.variant.color} × {item.quantity}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '0.75rem' }}>
                                        {formatPrice((item.customPrice ?? item.product.price) * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: '1.5rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                Total
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
