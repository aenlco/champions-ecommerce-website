import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import { useProducts } from '@/hooks/useProducts'

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']

// Fallback products for when Supabase isn't connected yet
const PLACEHOLDER_PRODUCTS = [
    { id: '1', name: 'Essential Tee', slug: 'essential-tee', price: 4800, category: 'Tops', images: [], description: '', is_active: true, pay_what_you_want: false, created_at: '' },
    { id: '2', name: 'Raw Hoodie', slug: 'raw-hoodie', price: 12800, category: 'Outerwear', images: [], description: '', is_active: true, pay_what_you_want: false, created_at: '' },
    { id: '3', name: 'Training Shorts', slug: 'training-shorts', price: 6800, category: 'Bottoms', images: [], description: '', is_active: true, pay_what_you_want: false, created_at: '' },
    { id: '4', name: 'Performance Tank', slug: 'performance-tank', price: 3800, category: 'Tops', images: [], description: '', is_active: true, pay_what_you_want: false, created_at: '' },
    { id: '5', name: 'Utility Joggers', slug: 'utility-joggers', price: 9800, category: 'Bottoms', images: [], description: '', is_active: true, pay_what_you_want: false, created_at: '' },
    { id: '6', name: 'Competition Cap', slug: 'competition-cap', price: 3200, category: 'Accessories', images: [], description: '', is_active: true, pay_what_you_want: false, created_at: '' },
]

export default function Collections() {
    const [searchParams] = useSearchParams()
    const categoryFromUrl = searchParams.get('category')
    const [activeCategory, setActiveCategory] = useState(categoryFromUrl || 'All')
    const { products: dbProducts, loading } = useProducts()

    const products = dbProducts.length > 0 ? dbProducts : PLACEHOLDER_PRODUCTS
    const filtered = activeCategory === 'All'
        ? products
        : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase())

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

    return (
        <PageTransition>
            <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
                {/* Page Header */}
                <div
                    style={{
                        padding: '0 clamp(1.5rem, 4vw, 3rem)',
                        maxWidth: '1400px',
                        margin: '0 auto',
                    }}
                >
                    {/* Category Filter */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '1.5rem',
                            marginBottom: '3rem',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            paddingBottom: '1rem',
                            overflowX: 'auto',
                        }}
                    >
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    fontSize: '0.625rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    fontWeight: activeCategory === cat ? 600 : 400,
                                    opacity: activeCategory === cat ? 1 : 0.5,
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease',
                                    paddingBottom: '0.25rem',
                                    borderBottom: activeCategory === cat ? '1px solid var(--color-black)' : '1px solid transparent',
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div
                    style={{
                        padding: '0 clamp(1.5rem, 4vw, 3rem)',
                        maxWidth: '1400px',
                        margin: '0 auto',
                        paddingBottom: '6rem',
                    }}
                >
                    {loading ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1.5rem',
                        }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i}>
                                    <div
                                        style={{
                                            aspectRatio: '3/4',
                                            backgroundColor: 'var(--color-gray-100)',
                                            marginBottom: '0.875rem',
                                            animation: 'pulse 2s infinite',
                                        }}
                                    />
                                    <div style={{ height: '0.75rem', width: '60%', backgroundColor: 'var(--color-gray-100)', marginBottom: '0.5rem' }} />
                                    <div style={{ height: '0.625rem', width: '30%', backgroundColor: 'var(--color-gray-100)' }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            layout
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '1.5rem',
                            }}
                        >
                            {filtered.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                >
                                    <Link to={`/product/${product.slug}`}>
                                        <motion.div
                                            whileHover={{ y: -4 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div
                                                style={{
                                                    aspectRatio: '3/4',
                                                    backgroundColor: 'var(--color-gray-100)',
                                                    marginBottom: '0.875rem',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                }}
                                            >
                                                {product.images?.[0] ? (
                                                    <motion.img
                                                        whileHover={{ scale: 1.04 }}
                                                        transition={{ duration: 0.6 }}
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontFamily: 'var(--font-mono)',
                                                                fontSize: '0.5625rem',
                                                                letterSpacing: '0.2em',
                                                                color: 'var(--color-gray-300)',
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            Image
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                                                {product.name}
                                            </p>
                                            <p style={{ fontSize: '0.6875rem', color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>
                                                {formatPrice(product.price)}
                                            </p>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </PageTransition>
    )
}
