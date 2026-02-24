import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'

interface ProductWithQuantity extends Product {
    total_quantity: number
}

export default function AdminProducts() {
    const [products, setProducts] = useState<ProductWithQuantity[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null)
    const [menuOpen, setMenuOpen] = useState<string | null>(null)

    const fetchProducts = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('products')
            .select('*, product_variants(stock_quantity)')
            .order('created_at', { ascending: false })

        const enriched: ProductWithQuantity[] = (data || []).map((p: any) => ({
            ...p,
            total_quantity: (p.product_variants || []).reduce(
                (sum: number, v: { stock_quantity: number }) => sum + (v.stock_quantity || 0),
                0
            ),
        }))

        setProducts(enriched)
        setLoading(false)
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleSync = async () => {
        setSyncing(true)
        setSyncResult(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: syncReq, error: insertError } = await supabase
                .from('sync_requests')
                .insert({ user_id: user.id })
                .select('id')
                .single()

            if (insertError || !syncReq) throw new Error(insertError?.message || 'Failed to create sync request')

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-square-catalog`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ request_id: syncReq.id }),
                }
            )
            const data = await response.json()
            const error = response.ok ? null : { message: data.error || 'Sync failed' }

            if (error) {
                setSyncResult({ success: false, message: error.message })
            } else {
                setSyncResult({
                    success: true,
                    message: `Synced ${data.synced} of ${data.total_items} products${data.errors ? `. ${data.errors.length} errors.` : '.'}`,
                })
                await fetchProducts()
            }
        } catch (err) {
            setSyncResult({ success: false, message: 'Failed to connect to sync function.' })
        }

        setSyncing(false)
    }

    const toggleActive = async (product: ProductWithQuantity) => {
        // Optimistic update — avoids refetch which can reorder rows
        setProducts(prev => prev.map(p =>
            p.id === product.id ? { ...p, is_active: !p.is_active } : p
        ))

        const { error } = await supabase
            .from('products')
            .update({ is_active: !product.is_active })
            .eq('id', product.id)

        if (error) {
            // Revert on failure
            setProducts(prev => prev.map(p =>
                p.id === product.id ? { ...p, is_active: product.is_active } : p
            ))
            setSyncResult({ success: false, message: `Failed to update status: ${error.message}` })
        }
    }

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

    const getSquareUrl = (product: Product) => {
        if (!product.square_catalog_id) return null
        return `https://squareup.com/dashboard/items/library/${product.square_catalog_id}`
    }

    return (
        <AdminLayout>
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                    }}>
                        Products
                    </h1>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        style={{
                            padding: '0.625rem 1.25rem',
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            backgroundColor: 'var(--color-black)',
                            color: 'var(--color-white)',
                            opacity: syncing ? 0.6 : 1,
                            cursor: syncing ? 'wait' : 'pointer',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {syncing ? 'Syncing...' : 'Sync from Square'}
                    </button>
                </div>

                {/* Sync Result */}
                {syncResult && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        marginBottom: '1.5rem',
                        border: `1px solid ${syncResult.success ? 'rgba(0,128,0,0.2)' : 'rgba(255,0,0,0.2)'}`,
                        backgroundColor: syncResult.success ? 'rgba(0,128,0,0.04)' : 'rgba(255,0,0,0.04)',
                    }}>
                        <p style={{
                            fontSize: '0.6875rem',
                            letterSpacing: '0.05em',
                            color: syncResult.success ? 'green' : 'red',
                        }}>
                            {syncResult.message}
                        </p>
                    </div>
                )}

                {loading ? (
                    <p style={{
                        fontSize: '0.6875rem',
                        color: 'var(--color-gray-400)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Loading products...
                    </p>
                ) : products.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: 'var(--color-white)',
                    }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginBottom: '1rem' }}>
                            No products yet. Sync from Square to import your catalog.
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            style={{
                                padding: '0.625rem 1.25rem',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                backgroundColor: 'var(--color-black)',
                                color: 'var(--color-white)',
                                cursor: 'pointer',
                            }}
                        >
                            Sync Now
                        </button>
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'var(--color-white)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 100px 120px 60px 80px',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                        }}>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Image</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Name</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Price</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Category</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Qty</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Status</span>
                        </div>

                        {/* Table Rows */}
                        {products.map(product => (
                            <div
                                key={product.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '60px 1fr 100px 120px 60px 80px',
                                    gap: '1rem',
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                                    alignItems: 'center',
                                    position: 'relative',
                                }}
                            >
                                {/* Image */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: 'var(--color-gray-100)',
                                    overflow: 'hidden',
                                }}>
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <span style={{ fontSize: '0.5rem', color: 'var(--color-gray-300)' }}>—</span>
                                        </div>
                                    )}
                                </div>

                                {/* Name — clickable with dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setMenuOpen(menuOpen === product.id ? null : product.id)}
                                        style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            textUnderlineOffset: '3px',
                                            textDecorationColor: 'rgba(0,0,0,0.15)',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {product.name}
                                    </button>
                                    {product.square_catalog_id && (
                                        <p style={{ fontSize: '0.5625rem', color: 'var(--color-gray-400)', marginTop: '0.125rem' }}>
                                            Square: {product.square_catalog_id.slice(-8)}
                                        </p>
                                    )}

                                    {/* Dropdown menu */}
                                    {menuOpen === product.id && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            marginTop: '0.25rem',
                                            backgroundColor: 'var(--color-white)',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            zIndex: 10,
                                            minWidth: '180px',
                                        }}>
                                            <a
                                                href={`/product/${product.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'block',
                                                    padding: '0.625rem 1rem',
                                                    fontSize: '0.625rem',
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--color-black)',
                                                    transition: 'background-color 0.15s',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-gray-50)')}
                                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                View on Site
                                            </a>
                                            {getSquareUrl(product) && (
                                                <a
                                                    href={getSquareUrl(product)!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'block',
                                                        padding: '0.625rem 1rem',
                                                        fontSize: '0.625rem',
                                                        letterSpacing: '0.1em',
                                                        textTransform: 'uppercase',
                                                        color: 'var(--color-black)',
                                                        borderTop: '1px solid rgba(0,0,0,0.04)',
                                                        transition: 'background-color 0.15s',
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-gray-50)')}
                                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                >
                                                    View in Square
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                <span style={{ fontSize: '0.75rem' }}>{formatPrice(product.price)}</span>

                                {/* Category */}
                                <span style={{ fontSize: '0.6875rem', color: 'var(--color-gray-500)' }}>
                                    {product.category}
                                </span>

                                {/* Quantity */}
                                <span style={{ fontSize: '0.75rem', color: product.total_quantity > 0 ? 'var(--color-black)' : 'var(--color-gray-400)' }}>
                                    {product.total_quantity}
                                </span>

                                {/* Status Toggle */}
                                <button
                                    onClick={() => toggleActive(product)}
                                    style={{
                                        position: 'relative',
                                        width: '44px',
                                        height: '22px',
                                        border: product.is_active ? '2px solid var(--color-black)' : '2px solid rgba(0,0,0,0.2)',
                                        backgroundColor: product.is_active ? 'var(--color-black)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        padding: 0,
                                    }}
                                    title={product.is_active ? 'Active — click to hide' : 'Hidden — click to activate'}
                                >
                                    <span style={{
                                        position: 'absolute',
                                        top: '2px',
                                        left: product.is_active ? '22px' : '2px',
                                        width: '14px',
                                        height: '14px',
                                        backgroundColor: product.is_active ? 'var(--color-white)' : 'rgba(0,0,0,0.25)',
                                        transition: 'left 0.2s, background-color 0.2s',
                                    }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info */}
                <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.625rem', color: 'var(--color-gray-400)', lineHeight: 1.8 }}>
                        Products are synced from your Square catalog. Use "Sync from Square" to pull the latest
                        items, prices, and inventory. Toggle the switch to show/hide products on the storefront.
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}
