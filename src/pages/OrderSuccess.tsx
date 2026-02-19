import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

export default function OrderSuccess() {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [orderId, setOrderId] = useState<string>('')

    useEffect(() => {
        // Generate a display-friendly order ID from session or random
        const id = sessionId
            ? `CHM-${sessionId.slice(-8).toUpperCase()}`
            : `CHM-${Date.now().toString(36).toUpperCase()}`
        setOrderId(id)
    }, [sessionId])

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
                    padding: 'clamp(1.5rem, 4vw, 3rem)',
                    textAlign: 'center',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ maxWidth: '480px' }}
                >
                    {/* Checkmark */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                        style={{
                            width: '48px',
                            height: '48px',
                            border: '1.5px solid var(--color-black)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem',
                        }}
                    >
                        <span style={{ fontSize: '1.25rem' }}>✓</span>
                    </motion.div>

                    <h1
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginBottom: '0.75rem',
                        }}
                    >
                        Order Confirmed
                    </h1>

                    <p
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-gray-500)',
                            lineHeight: 1.8,
                            marginBottom: '2rem',
                        }}
                    >
                        Thank you for your order. You'll receive a confirmation email shortly with your tracking information.
                    </p>

                    <div
                        style={{
                            padding: '1.25rem',
                            border: '1px solid rgba(0,0,0,0.06)',
                            marginBottom: '2rem',
                        }}
                    >
                        <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.5rem' }}>
                            Order Number
                        </p>
                        <p
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                            }}
                        >
                            {orderId}
                        </p>
                    </div>

                    <Link
                        to="/collections"
                        style={{
                            display: 'inline-block',
                            padding: '0.875rem 2.5rem',
                            border: '1px solid var(--color-black)',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'var(--color-black)'
                            e.currentTarget.style.color = 'var(--color-white)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'var(--color-black)'
                        }}
                    >
                        CONTINUE SHOPPING
                    </Link>
                </motion.div>
            </div>
        </PageTransition>
    )
}
