import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'

export default function CartDrawer() {
    const { items, removeItem, updateQuantity, subtotal, isCartOpen, closeCart } = useCart()

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={closeCart}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            zIndex: 200,
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: 'min(420px, 85vw)',
                            backgroundColor: 'var(--color-white)',
                            zIndex: 201,
                            display: 'flex',
                            flexDirection: 'column',
                            borderLeft: '1px solid rgba(0,0,0,0.06)',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                BAG ({items.length})
                            </span>
                            <button
                                onClick={closeCart}
                                style={{
                                    fontSize: '0.6875rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    opacity: 0.5,
                                }}
                            >
                                CLOSE
                            </button>
                        </div>

                        {/* Items */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {items.length === 0 ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: '0.75rem',
                                            letterSpacing: '0.1em',
                                            color: 'var(--color-gray-400)',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        Your bag is empty
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {items.map(item => (
                                        <motion.div
                                            key={item.variant.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                paddingBottom: '1.5rem',
                                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            {/* Thumbnail */}
                                            <div
                                                style={{
                                                    width: '80px',
                                                    height: '100px',
                                                    backgroundColor: 'var(--color-gray-100)',
                                                    flexShrink: 0,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {item.product.images?.[0] && (
                                                    <img
                                                        src={item.product.images[0]}
                                                        alt={item.product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                                    {item.product.name}
                                                </p>
                                                <p style={{ fontSize: '0.625rem', color: 'var(--color-gray-500)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                    {item.variant.size} / {item.variant.color}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                    {formatPrice(item.customPrice ?? item.product.price)}
                                                </p>

                                                {/* Quantity + Remove */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.1)' }}>
                                                        <button
                                                            onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                        >
                                                            −
                                                        </button>
                                                        <span style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', minWidth: '1.5rem', textAlign: 'center' }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.variant.id)}
                                                        style={{
                                                            fontSize: '0.625rem',
                                                            letterSpacing: '0.1em',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--color-gray-400)',
                                                            textDecoration: 'underline',
                                                            textUnderlineOffset: '2px',
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div
                                style={{
                                    padding: '1.5rem',
                                    borderTop: '1px solid rgba(0,0,0,0.06)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '1.25rem',
                                    }}
                                >
                                    <span style={{ fontSize: '0.6875rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                        Subtotal
                                    </span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>
                                <a
                                    href="/checkout"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.875rem',
                                        backgroundColor: 'var(--color-black)',
                                        color: 'var(--color-white)',
                                        textAlign: 'center',
                                        fontSize: '0.6875rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.2em',
                                        textTransform: 'uppercase',
                                        transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                                >
                                    CHECKOUT
                                </a>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
