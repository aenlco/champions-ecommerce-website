import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)

    // Sync selectedColor when variants load from DB or change
    useEffect(() => {
        if (colors.length > 0 && (!selectedColor || !colors.includes(selectedColor))) {
            setSelectedColor(colors[0])
            setSelectedSize('') // Reset size when color changes/resets
        }
    }, [variants]) // variants dependency ensures this runs when data loads

    const sizesForColor = variants.filter(v => v.color === selectedColor)
    const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize)

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

    const handleAdd = () => {
        if (!selectedVariant) return
        addItem(product, selectedVariant, quantity)
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
                {/* Breadcrumb */}
                <div
                    style={{
                        padding: '1rem clamp(1.5rem, 4vw, 3rem)',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        fontSize: '0.5625rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--color-gray-400)',
                        maxWidth: '1400px',
                        margin: '0 auto',
                    }}>
                        <Link to="/collections" style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>Collections</Link>
                        <span>/</span>
                        <span style={{ color: 'var(--color-black)' }}>{product.name}</span>
                    </div>
                </div>

                {/* Split Layout */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        maxWidth: '1400px',
                        margin: '0 auto',
                    }}
                    className="md:grid-cols-[1.4fr_1fr]"
                >
                    {/* Left: Images */}
                    <div
                        style={{
                            padding: 'clamp(1.5rem, 4vw, 3rem)',
                            position: 'sticky',
                            top: '60px',
                            alignSelf: 'start',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                            }}
                        >
                            {(product.images?.length > 0 ? product.images : [null, null]).map((img, i) => (
                                <div
                                    key={i}
                                    style={{
                                        aspectRatio: '4/5',
                                        backgroundColor: 'var(--color-gray-100)',
                                        overflow: 'hidden',
                                        position: 'relative',
                                    }}
                                >
                                    {img ? (
                                        <img src={img} alt={`${product.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.5625rem',
                                                letterSpacing: '0.2em',
                                                color: 'var(--color-gray-300)',
                                                textTransform: 'uppercase',
                                            }}>
                                                {i === 0 ? 'Front' : 'Back'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div
                        style={{
                            padding: 'clamp(1.5rem, 4vw, 3rem)',
                            borderLeft: '1px solid rgba(0,0,0,0.04)',
                        }}
                    >
                        <h1
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '1.125rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem',
                            }}
                        >
                            {product.name}
                        </h1>
                        <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '2rem' }}>
                            {formatPrice(product.price)}
                        </p>

                        {/* Color */}
                        {colors.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p className="text-label" style={{ marginBottom: '0.75rem', color: 'var(--color-gray-500)' }}>
                                    Color — {selectedColor}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                setSelectedColor(color)
                                                setSelectedSize('')
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: selectedColor === color
                                                    ? '1px solid var(--color-black)'
                                                    : '1px solid rgba(0,0,0,0.1)',
                                                fontSize: '0.6875rem',
                                                letterSpacing: '0.1em',
                                                textTransform: 'uppercase',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p className="text-label" style={{ marginBottom: '0.75rem', color: 'var(--color-gray-500)' }}>
                                Size
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {sizesForColor.map(variant => (
                                    <button
                                        key={variant.id}
                                        onClick={() => setSelectedSize(variant.size)}
                                        disabled={variant.stock_quantity <= 0}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            minWidth: '3rem',
                                            border: selectedSize === variant.size
                                                ? '1px solid var(--color-black)'
                                                : '1px solid rgba(0,0,0,0.1)',
                                            fontSize: '0.6875rem',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            opacity: variant.stock_quantity <= 0 ? 0.3 : 1,
                                            cursor: variant.stock_quantity <= 0 ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {variant.size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div style={{ marginBottom: '2rem' }}>
                            <p className="text-label" style={{ marginBottom: '0.75rem', color: 'var(--color-gray-500)' }}>
                                Quantity
                            </p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.1)' }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                                >
                                    −
                                </button>
                                <span style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', minWidth: '2rem', textAlign: 'center', borderLeft: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Stock indicator */}
                        {selectedVariant && (
                            <p style={{
                                fontSize: '0.625rem',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                marginBottom: '1rem',
                                color: selectedVariant.stock_quantity <= 3 ? '#c53030' : 'var(--color-gray-500)',
                            }}>
                                {selectedVariant.stock_quantity <= 3
                                    ? `Only ${selectedVariant.stock_quantity} left`
                                    : 'In Stock'}
                            </p>
                        )}

                        {/* Add to Bag */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAdd}
                            disabled={!selectedVariant}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: added ? 'var(--color-gray-800)' : 'var(--color-black)',
                                color: 'var(--color-white)',
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                opacity: selectedVariant ? 1 : 0.4,
                                cursor: selectedVariant ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s ease',
                                marginBottom: '2rem',
                            }}
                        >
                            {added ? '✓ ADDED TO BAG' :
                                !selectedColor ? 'SELECT COLOR' :
                                    !selectedSize ? 'SELECT SIZE' :
                                        !selectedVariant ? 'OUT OF STOCK' :
                                            'ADD TO BAG'}
                        </motion.button>

                        {/* Description */}
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1.5rem' }}>
                            <p className="text-label" style={{ marginBottom: '0.75rem', color: 'var(--color-gray-500)' }}>
                                Description
                            </p>
                            <p style={{ fontSize: '0.8125rem', lineHeight: 1.8, color: 'var(--color-gray-600)' }}>
                                {product.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
