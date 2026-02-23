import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { useAuth } from '@/context/AuthContext'
import { useOrders } from '@/hooks/useOrders'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/types'

export default function Account() {
    const navigate = useNavigate()
    const { user, signOut } = useAuth()
    const { orders, loading: ordersLoading } = useOrders()

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '' })

    useEffect(() => {
        if (!user) return

        async function fetchProfile() {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user!.id)
                .single()

            if (data) {
                setProfile(data)
                setEditForm({
                    full_name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                })
            }
            setProfileLoading(false)
        }

        fetchProfile()
    }, [user])

    const handleSave = async () => {
        if (!user) return
        setSaving(true)

        const { data } = await supabase
            .from('profiles')
            .update({
                full_name: editForm.full_name,
                email: editForm.email,
                phone: editForm.phone,
            })
            .eq('id', user.id)
            .select()
            .single()

        if (data) setProfile(data)
        setSaving(false)
        setEditing(false)
    }

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid rgba(0,0,0,0.12)',
        fontSize: '0.75rem',
        letterSpacing: '0.05em',
        backgroundColor: 'transparent',
    }

    return (
        <PageTransition>
            <div style={{
                paddingTop: '100px',
                minHeight: '100vh',
                maxWidth: '800px',
                margin: '0 auto',
                padding: 'clamp(1.5rem, 4vw, 3rem)',
            }}>
                <h1 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '3rem',
                }}>
                    Account
                </h1>

                {/* Profile Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                    }}>
                        <h2 className="text-label" style={{ color: 'var(--color-gray-500)' }}>
                            Profile
                        </h2>
                        {!editing && !profileLoading && (
                            <button
                                onClick={() => setEditing(true)}
                                style={{
                                    fontSize: '0.625rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                    color: 'var(--color-gray-500)',
                                }}
                            >
                                EDIT
                            </button>
                        )}
                    </div>

                    {profileLoading ? (
                        <p style={{ fontSize: '0.6875rem', color: 'var(--color-gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Loading...
                        </p>
                    ) : editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.5rem' }}>Name</p>
                                <input
                                    value={editForm.full_name}
                                    onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                    placeholder="Full Name"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.5rem' }}>Email</p>
                                <input
                                    value={editForm.email}
                                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Email"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.5rem' }}>Phone</p>
                                <input
                                    value={editForm.phone}
                                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Phone"
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: 'var(--color-black)',
                                        color: 'var(--color-white)',
                                        fontSize: '0.625rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        opacity: saving ? 0.6 : 1,
                                        cursor: saving ? 'wait' : 'pointer',
                                    }}
                                >
                                    {saving ? 'SAVING...' : 'SAVE'}
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '1px solid rgba(0,0,0,0.12)',
                                        fontSize: '0.625rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.25rem' }}>Name</p>
                                <p style={{ fontSize: '0.8125rem' }}>{profile?.full_name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.25rem' }}>Email</p>
                                <p style={{ fontSize: '0.8125rem' }}>{profile?.email || user?.email || '—'}</p>
                            </div>
                            <div>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.25rem' }}>Phone</p>
                                <p style={{ fontSize: '0.8125rem' }}>{profile?.phone || user?.phone || '—'}</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Order History Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 className="text-label" style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>
                        Order History
                    </h2>

                    {ordersLoading ? (
                        <p style={{ fontSize: '0.6875rem', color: 'var(--color-gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Loading...
                        </p>
                    ) : orders.length === 0 ? (
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>
                            No orders yet.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.25rem 0',
                                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <div>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                            CHM-{order.id.slice(-8).toUpperCase()}
                                        </p>
                                        <p style={{
                                            fontSize: '0.625rem',
                                            color: 'var(--color-gray-400)',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            marginTop: '0.25rem',
                                        }}>
                                            {formatDate(order.created_at)} — {order.status}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                                        {formatPrice(order.total)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    style={{
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
                    SIGN OUT
                </button>
            </div>
        </PageTransition>
    )
}
