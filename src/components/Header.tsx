import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { itemCount, toggleCart } = useCart()
    const { user } = useAuth()
    const location = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 clamp(1.5rem, 4vw, 3rem)',
                backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
                transition: 'all 0.4s ease',
            }}
        >
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="Charles K" style={{ height: '25px', width: 'auto' }} />
            </Link>

            {/* Right: Shop + Profile + Cart + Mobile Hamburger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <Link
                    to="/shop"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        opacity: location.pathname === '/shop' ? 1 : 0.6,
                        transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => {
                        if (location.pathname !== '/shop') {
                            e.currentTarget.style.opacity = '0.6'
                        }
                    }}
                    aria-label="Shop"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                        <polygon points="12,3 22,21 2,21" />
                    </svg>
                </Link>
                <Link
                    to={user ? '/account' : '/sign-in'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        opacity: ['/account', '/sign-in'].includes(location.pathname) ? 1 : 0.6,
                        transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => {
                        if (!['/account', '/sign-in'].includes(location.pathname)) {
                            e.currentTarget.style.opacity = '0.6'
                        }
                    }}
                    aria-label={user ? 'Account' : 'Sign in'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </Link>
                <button
                    onClick={toggleCart}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: 0.6,
                        transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                    aria-label="Shopping bag"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <AnimatePresence>
                        {itemCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-6px',
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-black)',
                                    color: 'var(--color-white)',
                                    fontSize: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                }}
                            >
                                {itemCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        padding: '4px',
                    }}
                    aria-label="Menu"
                >
                    <span style={{
                        width: '18px',
                        height: '1px',
                        backgroundColor: 'var(--color-black)',
                        transition: 'transform 0.3s',
                        transform: mobileMenuOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
                    }} />
                    <span style={{
                        width: '18px',
                        height: '1px',
                        backgroundColor: 'var(--color-black)',
                        transition: 'opacity 0.3s',
                        opacity: mobileMenuOpen ? 0 : 1,
                    }} />
                    <span style={{
                        width: '18px',
                        height: '1px',
                        backgroundColor: 'var(--color-black)',
                        transition: 'transform 0.3s',
                        transform: mobileMenuOpen ? 'rotate(-45deg) translate(2px, -2px)' : 'none',
                    }} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden"
                        style={{
                            position: 'fixed',
                            top: '60px',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255,255,255,0.98)',
                            backdropFilter: 'blur(20px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2.5rem',
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0, duration: 0.4 }}
                        >
                            <Link
                                to="/shop"
                                style={{
                                    fontSize: '0.875rem',
                                    letterSpacing: '0.2em',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                }}
                            >
                                SHOP
                            </Link>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                        >
                            <Link
                                to={user ? '/account' : '/sign-in'}
                                style={{
                                    fontSize: '0.875rem',
                                    letterSpacing: '0.2em',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                }}
                            >
                                {user ? 'ACCOUNT' : 'SIGN IN'}
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
