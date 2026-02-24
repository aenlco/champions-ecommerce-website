import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'

const MOCK_ORDERS: Order[] = [
    {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        user_id: null,
        square_payment_id: 'sq_pay_abc123def456',
        status: 'paid',
        total: 8500,
        shipping_address: { full_name: 'Marcus Johnson', line1: '742 Evergreen Terrace', city: 'Chicago', state: 'IL', postal_code: '60614', country: 'US' },
        created_at: '2026-02-23T14:32:00Z',
    },
    {
        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        user_id: null,
        square_payment_id: 'sq_pay_ghi789jkl012',
        status: 'shipped',
        total: 12000,
        shipping_address: { full_name: 'Aria Williams', line1: '1600 Pennsylvania Ave', city: 'Atlanta', state: 'GA', postal_code: '30301', country: 'US' },
        created_at: '2026-02-22T09:15:00Z',
    },
    {
        id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        user_id: null,
        square_payment_id: 'sq_pay_mno345pqr678',
        status: 'delivered',
        total: 4500,
        shipping_address: { full_name: 'Devon Carter', line1: '350 Fifth Avenue', city: 'New York', state: 'NY', postal_code: '10118', country: 'US' },
        created_at: '2026-02-20T18:45:00Z',
    },
    {
        id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
        user_id: null,
        square_payment_id: 'sq_pay_stu901vwx234',
        status: 'paid',
        total: 15500,
        shipping_address: { full_name: 'Jasmine Lee', line1: '8800 Sunset Blvd', city: 'Los Angeles', state: 'CA', postal_code: '90069', country: 'US' },
        created_at: '2026-02-19T11:20:00Z',
    },
    {
        id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
        user_id: null,
        square_payment_id: 'sq_pay_yza567bcd890',
        status: 'cancelled',
        total: 6000,
        shipping_address: { full_name: 'Tyler Brooks', line1: '200 E Randolph St', city: 'Houston', state: 'TX', postal_code: '77001', country: 'US' },
        created_at: '2026-02-18T16:05:00Z',
    },
    {
        id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
        user_id: null,
        square_payment_id: 'sq_pay_efg123hij456',
        status: 'refunded',
        total: 9500,
        shipping_address: { full_name: 'Nina Patel', line1: '1 Infinite Loop', city: 'Miami', state: 'FL', postal_code: '33101', country: 'US' },
        created_at: '2026-02-17T08:30:00Z',
    },
]

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [showingMock, setShowingMock] = useState(false)

    useEffect(() => {
        async function fetchOrders() {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (data && data.length > 0) {
                setOrders(data)
            } else {
                setOrders(MOCK_ORDERS)
                setShowingMock(true)
            }
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

                {showingMock && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(0,0,0,0.08)',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                    }}>
                        <p style={{ fontSize: '0.6875rem', letterSpacing: '0.05em', color: 'var(--color-gray-500)' }}>
                            Showing sample data for preview. Real orders will appear here once customers complete purchases.
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
                            gridTemplateColumns: '120px 1fr 140px 80px 100px 120px',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                        }}>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Order ID</span>
                            <span className="text-label" style={{ color: 'var(--color-gray-400)' }}>Customer</span>
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
                                    gridTemplateColumns: '120px 1fr 140px 80px 100px 120px',
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
                                    {order.shipping_address?.full_name || '—'}
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
