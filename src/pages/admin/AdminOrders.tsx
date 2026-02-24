import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrders() {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            setOrders(data || [])
            setLoading(false)
        }

        fetchOrders()
    }, [])

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    const updateStatus = async (orderId: string, status: string) => {
        await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)

        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    }

    const statusColors: Record<string, string> = {
        paid: 'green',
        shipped: 'blue',
        delivered: 'green',
        cancelled: 'red',
        refunded: 'orange',
    }

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
                    Orders
                </h1>

                {loading ? (
                    <p style={{
                        fontSize: '0.6875rem',
                        color: 'var(--color-gray-400)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Loading orders...
                    </p>
                ) : orders.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: 'var(--color-white)',
                    }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>
                            No orders yet.
                        </p>
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'var(--color-white)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '140px 1fr 100px 120px 120px',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                        }}>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Order ID</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Date</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Total</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Status</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Actions</span>
                        </div>

                        {/* Rows */}
                        {orders.map(order => (
                            <div
                                key={order.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '140px 1fr 100px 120px 120px',
                                    gap: '1rem',
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                                    alignItems: 'center',
                                }}
                            >
                                <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                    CHM-{order.id.slice(-8).toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--color-gray-500)' }}>
                                    {formatDate(order.created_at)}
                                </span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                    {formatPrice(order.total)}
                                </span>
                                <span style={{
                                    fontSize: '0.5625rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: statusColors[order.status] || 'var(--color-gray-500)',
                                }}>
                                    {order.status}
                                </span>
                                <select
                                    value={order.status}
                                    onChange={e => updateStatus(order.id, e.target.value)}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.5625rem',
                                        letterSpacing: '0.05em',
                                        border: '1px solid rgba(0,0,0,0.12)',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        width: 'auto',
                                    }}
                                >
                                    <option value="paid">Paid</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
