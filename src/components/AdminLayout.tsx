import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
    { label: 'Overview', path: '/admin' },
    { label: 'Products', path: '/admin/products' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Homepage', path: '/admin/homepage' },
    { label: 'Media', path: '/admin/media' },
    { label: 'Music Player', path: '/admin/music-player' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Admin Header */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 clamp(1.5rem, 4vw, 3rem) 0 1.5rem',
                height: '60px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                backgroundColor: 'var(--color-white)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src="/logo.png" alt="Charles K" style={{ height: '20px', width: 'auto' }} />
                        <span style={{
                            fontSize: '0.5625rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--color-gray-400)',
                            fontWeight: 600,
                        }}>
                            Admin
                        </span>
                    </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link
                        to="/"
                        style={{
                            fontSize: '0.625rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--color-gray-400)',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-black)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-gray-400)')}
                    >
                        View Site
                    </Link>
                    <button
                        onClick={handleSignOut}
                        style={{
                            fontSize: '0.625rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--color-gray-400)',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-black)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-gray-400)')}
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Sidebar */}
                <nav style={{
                    width: '200px',
                    borderRight: '1px solid rgba(0,0,0,0.06)',
                    padding: '1.5rem 0',
                    flexShrink: 0,
                }}>
                    {NAV_ITEMS.map(item => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'block',
                                    padding: '0.625rem 1.5rem',
                                    fontSize: '0.6875rem',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'var(--color-black)' : 'var(--color-gray-400)',
                                    borderLeft: isActive ? '2px solid var(--color-black)' : '2px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) e.currentTarget.style.color = 'var(--color-gray-600)'
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) e.currentTarget.style.color = 'var(--color-gray-400)'
                                }}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Content */}
                <main style={{
                    flex: 1,
                    padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                    backgroundColor: 'var(--color-gray-50)',
                    overflow: 'auto',
                }}>
                    {children}
                </main>
            </div>
        </div>
    )
}
