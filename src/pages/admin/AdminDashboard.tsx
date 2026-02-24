import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
    totalProducts: number
    activeProducts: number
    totalOrders: number
    totalRevenue: number
    totalEntries: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalEntries: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            const [products, activeProducts, orders, entries] = await Promise.all([
                supabase.from('products').select('id', { count: 'exact', head: true }),
                supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('orders').select('id, total'),
                supabase.from('homepage_entries').select('id', { count: 'exact', head: true }),
            ])

            const totalRevenue = (orders.data || []).reduce((sum, o) => sum + (o.total || 0), 0)

            setStats({
                totalProducts: products.count || 0,
                activeProducts: activeProducts.count || 0,
                totalOrders: orders.data?.length || 0,
                totalRevenue,
                totalEntries: entries.count || 0,
            })
            setLoading(false)
        }

        fetchStats()
    }, [])

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

    const statCards = [
        { label: 'Total Products', value: stats.totalProducts, link: '/admin/products' },
        { label: 'Active Products', value: stats.activeProducts, link: '/admin/products' },
        { label: 'Total Orders', value: stats.totalOrders, link: '/admin/orders' },
        { label: 'Revenue', value: formatPrice(stats.totalRevenue), link: '/admin/orders' },
        { label: 'Homepage Entries', value: stats.totalEntries, link: '/admin/homepage' },
    ]

    return (
        <AdminLayout>
            <div>
                <h1 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '2rem',
                }}>
                    Dashboard
                </h1>

                {loading ? (
                    <p style={{
                        fontSize: '0.6875rem',
                        color: 'var(--color-gray-400)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Loading...
                    </p>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '1rem',
                    }}>
                        {statCards.map(card => (
                            <Link
                                key={card.label}
                                to={card.link}
                                style={{
                                    padding: '1.5rem',
                                    backgroundColor: 'var(--color-white)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    transition: 'border-color 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)')}
                            >
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.75rem' }}>
                                    {card.label}
                                </p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                                    {card.value}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div style={{ marginTop: '2.5rem' }}>
                    <p className="text-label" style={{ color: 'var(--color-gray-500)', marginBottom: '1rem' }}>
                        Quick Actions
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <Link
                            to="/admin/products"
                            style={{
                                padding: '0.625rem 1.25rem',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                backgroundColor: 'var(--color-black)',
                                color: 'var(--color-white)',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                            Sync Products
                        </Link>
                        <Link
                            to="/admin/homepage"
                            style={{
                                padding: '0.625rem 1.25rem',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                border: '1px solid var(--color-black)',
                                transition: 'all 0.2s',
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
                            Manage Homepage
                        </Link>
                        <Link
                            to="/admin/media"
                            style={{
                                padding: '0.625rem 1.25rem',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                border: '1px solid var(--color-black)',
                                transition: 'all 0.2s',
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
                            Upload Media
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
