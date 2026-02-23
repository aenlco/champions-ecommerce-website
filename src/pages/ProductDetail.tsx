import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/context/CartContext'
import type { ProductVariant } from '@/lib/types'

// Fallback product for when Supabase isn't connected
const FALLBACK_PRODUCT = {
    id: 'demo-1',
    name: 'Essential Tee',
    slug: 'essential-tee',
    description: 'Cut from heavyweight 240gsm cotton. Pre-shrunk, enzyme-washed for a lived-in feel from day one. Zero logos, zero noise — just the essentials. Crafted for athletes who value substance over spectacle.',
    price: 4800,
    images: [],
    category: 'Tops',
    is_active: true,
    pay_what_you_want: false,
    created_at: '',
}

const FALLBACK_VARIANTS: ProductVariant[] = [
    { id: 'v1', product_id: 'demo-1', size: 'S', color: 'Black', stock_quantity: 10, sku: 'ET-S-BLK' },
    { id: 'v2', product_id: 'demo-1', size: 'M', color: 'Black', stock_quantity: 15, sku: 'ET-M-BLK' },
    { id: 'v3', product_id: 'demo-1', size: 'L', color: 'Black', stock_quantity: 12, sku: 'ET-L-BLK' },
    { id: 'v4', product_id: 'demo-1', size: 'XL', color: 'Black', stock_quantity: 8, sku: 'ET-XL-BLK' },
    { id: 'v5', product_id: 'demo-1', size: 'S', color: 'White', stock_quantity: 10, sku: 'ET-S-WHT' },
    { id: 'v6', product_id: 'demo-1', size: 'M', color: 'White', stock_quantity: 14, sku: 'ET-M-WHT' },
    { id: 'v7', product_id: 'demo-1', size: 'L', color: 'White', stock_quantity: 11, sku: 'ET-L-WHT' },
    { id: 'v8', product_id: 'demo-1', size: 'XL', color: 'White', stock_quantity: 6, sku: 'ET-XL-WHT' },
]

export default function ProductDetail() {
    const { slug } = useParams<{ slug: string }>()
    const { product: dbProduct, variants: dbVariants, loading } = useProduct(slug || '')
    const { addItem } = useCart()

    const product = dbProduct || FALLBACK_PRODUCT
    const variants = dbVariants.length > 0 ? dbVariants : FALLBACK_VARIANTS

    const colors = [...new Set(variants.map(v => v.color))]
    const [selectedColor, setSelectedColor] = useState(colors[0] || '')
    const [selectedSize, setSelectedSize] = useState('')
    const [added, setAdded] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(true)
    const [additionalOpen, setAdditionalOpen] = useState(true)
    const [customPriceDollars, setCustomPriceDollars] = useState('')

    // Sync selectedColor when variants load
    useEffect(() => {
        if (colors.length > 0 && (!selectedColor || !colors.includes(selectedColor))) {
            setSelectedColor(colors[0])
            setSelectedSize('')
        }
    }, [variants])

    // Init custom price display when product loads
    useEffect(() => {
        if (product.pay_what_you_want) {
            setCustomPriceDollars((product.price / 100).toFixed(2))
        }
    }, [product.pay_what_you_want, product.price])

    const sizesForColor = variants.filter(v => v.color === selectedColor)
    const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize)

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`

    const customPriceCents = Math.round(parseFloat(customPriceDollars || '0') * 100)
    const isCustomPriceValid = !product.pay_what_you_want || customPriceCents >= product.price

    const handleAdd = () => {
        if (!selectedVariant) return
        addItem(
            product,
            selectedVariant,
            1,
            product.pay_what_you_want ? customPriceCents : undefined
        )
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    if (loading) {
        return (
            <PageTransition>
                <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.625rem', letterSpacing: '0.2em', color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                        Loading...
                    </span>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
                {/* Split Layout — use className only for grid so responsive works */}
                <div
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr]"
                    style={{ maxWidth: '1400px', margin: '0 auto' }}
                >
                    {/* Left: Single Image */}
                    <div
                        style={{
                            position: 'sticky',
                            top: '60px',
                            alignSelf: 'start',
                        }}
                    >
                        <div
                            style={{
                                aspectRatio: '3/4',
                                backgroundColor: 'var(--color-gray-100)',
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        >
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.5625rem',
                                        letterSpacing: '0.2em',
                                        color: 'var(--color-gray-300)',
                                        textTransform: 'uppercase',
                                    }}>
                                        Product Image
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div
                        style={{
                            padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                        }}
                    >
                        {/* Name + Price */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            paddingBottom: '1.25rem',
                            marginBottom: '1.25rem',
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                        }}>
                            <h1
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    flex: 1,
                                    marginRight: '1rem',
                                }}
                            >
                                {product.name}
                            </h1>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                            }}>
                                {formatPrice(product.price)} USD
                            </span>
                        </div>

                        {/* Size Dropdown */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <select
                                value={selectedSize}
                                onChange={e => setSelectedSize(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 1rem',
                                    borderTop: 'none',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                                    fontSize: '0.6875rem',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.5'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0 center',
                                    cursor: 'pointer',
                                    backgroundColor: 'transparent',
                                }}
                            >
                                <option value="">Select Size</option>
                                {sizesForColor.map(v => (
                                    <option key={v.id} value={v.size} disabled={v.stock_quantity <= 0}>
                                        {v.size}{v.stock_quantity <= 0 ? ' — Sold Out' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Color selector — only show if multiple colors */}
                        {colors.length > 1 && (
                            <div style={{ marginBottom: '0.75rem' }}>
                                <select
                                    value={selectedColor}
                                    onChange={e => { setSelectedColor(e.target.value); setSelectedSize('') }}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 1rem',
                                        borderTop: 'none',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderBottom: '1px solid rgba(0,0,0,0.12)',
                                        fontSize: '0.6875rem',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23999' stroke-width='1.5'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0 center',
                                        cursor: 'pointer',
                                        backgroundColor: 'transparent',
                                    }}
                                >
                                    {colors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Sizing Note */}
                        <p style={{
                            fontSize: '0.625rem',
                            color: 'var(--color-gray-500)',
                            marginTop: '0.75rem',
                            marginBottom: '0.25rem',
                        }}>
                            Unisex style. Women should consider ordering 1 size smaller.
                        </p>
                        <p style={{
                            fontSize: '0.5625rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                            marginBottom: '1.25rem',
                            cursor: 'pointer',
                        }}>
                            SIZE GUIDE
                        </p>

                        {/* PWYW Price Input */}
                        {product.pay_what_you_want && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <p className="text-label" style={{ marginBottom: '0.75rem', color: 'var(--color-gray-500)' }}>
                                    Name Your Price (minimum {formatPrice(product.price)} USD)
                                </p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid rgba(0,0,0,0.12)',
                                }}>
                                    <span style={{
                                        padding: '0.75rem',
                                        fontSize: '0.875rem',
                                        borderRight: '1px solid rgba(0,0,0,0.12)',
                                        color: 'var(--color-gray-500)',
                                    }}>
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min={(product.price / 100).toFixed(2)}
                                        step="0.01"
                                        value={customPriceDollars}
                                        onChange={e => setCustomPriceDollars(e.target.value)}
                                        style={{
                                            border: 'none',
                                            flex: 1,
                                            padding: '0.75rem',
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                </div>
                                {!isCustomPriceValid && customPriceDollars !== '' && (
                                    <p style={{
                                        fontSize: '0.625rem',
                                        color: '#dc2626',
                                        marginTop: '0.5rem',
                                        letterSpacing: '0.05em',
                                    }}>
                                        Minimum price is {formatPrice(product.price)} USD
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Add to Bag */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAdd}
                            disabled={!selectedVariant || (product.pay_what_you_want && !isCustomPriceValid)}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: added ? 'var(--color-gray-800)' : 'var(--color-black)',
                                color: 'var(--color-white)',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                opacity: selectedVariant && isCustomPriceValid ? 1 : 0.4,
                                cursor: selectedVariant && isCustomPriceValid ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s ease',
                                marginBottom: '1.5rem',
                            }}
                        >
                            {added ? 'ADDED TO BAG' :
                                !selectedSize ? 'SELECT SIZE' :
                                    !selectedVariant ? 'OUT OF STOCK' :
                                        'ADD TO BAG'}
                        </motion.button>

                        {/* DETAILS — Expandable */}
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                            <button
                                onClick={() => setDetailsOpen(!detailsOpen)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem 0',
                                    fontSize: '0.625rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                DETAILS
                                <span style={{
                                    transform: detailsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                    fontSize: '0.625rem',
                                }}>
                                    ▾
                                </span>
                            </button>
                            <AnimatePresence initial={false}>
                                {detailsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ paddingBottom: '1.25rem' }}>
                                            <p style={{
                                                fontSize: '0.6875rem',
                                                color: 'var(--color-gray-500)',
                                                marginBottom: '0.75rem',
                                            }}>
                                                This item is final sale and not eligible for return or exchange.
                                            </p>
                                            <div style={{
                                                fontSize: '0.6875rem',
                                                lineHeight: 1.8,
                                                color: 'var(--color-gray-600)',
                                            }}>
                                                {product.description.split('\n').map((line, i) => (
                                                    <p key={i} style={{
                                                        fontWeight: line.startsWith('Made in') || line.startsWith('Material') ? 700 : 400,
                                                    }}>
                                                        {line}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ADDITIONAL INFO — Expandable */}
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                            <button
                                onClick={() => setAdditionalOpen(!additionalOpen)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem 0',
                                    fontSize: '0.625rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                ADDITIONAL INFO
                                <span style={{
                                    transform: additionalOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                    fontSize: '0.625rem',
                                }}>
                                    ▾
                                </span>
                            </button>
                            <AnimatePresence initial={false}>
                                {additionalOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ paddingBottom: '1.25rem' }}>
                                            <p style={{
                                                fontSize: '0.6875rem',
                                                color: 'var(--color-gray-600)',
                                                marginBottom: '0.5rem',
                                            }}>
                                                Questions?{' '}
                                                <span style={{
                                                    fontWeight: 600,
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    textDecoration: 'underline',
                                                    textUnderlineOffset: '3px',
                                                    cursor: 'pointer',
                                                    marginLeft: '0.5rem',
                                                }}>
                                                    CONTACT US
                                                </span>
                                            </p>
                                            <p style={{
                                                fontSize: '0.6875rem',
                                                color: 'var(--color-gray-600)',
                                            }}>
                                                Free Shipping on orders over $100. Free returns.{' '}
                                                <span style={{
                                                    fontWeight: 600,
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    textDecoration: 'underline',
                                                    textUnderlineOffset: '3px',
                                                    cursor: 'pointer',
                                                    marginLeft: '0.5rem',
                                                }}>
                                                    LEARN MORE
                                                </span>
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* View More Links */}
                        <div style={{
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Link
                                to={`/shop?category=${encodeURIComponent(product.category)}`}
                                style={{
                                    display: 'block',
                                    fontSize: '0.625rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    fontWeight: 500,
                                    padding: '1rem 0',
                                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                                }}
                            >
                                VIEW MORE FROM <strong>{product.name.split(' ')[0].toUpperCase()}</strong>
                            </Link>
                            <Link
                                to={`/shop?category=${encodeURIComponent(product.category)}`}
                                style={{
                                    display: 'block',
                                    fontSize: '0.625rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    fontWeight: 500,
                                    padding: '1rem 0',
                                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                                }}
                            >
                                VIEW MORE FROM <strong>{product.category.toUpperCase()}</strong>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
