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
            <Link
                to="/"
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                }}
            >
                CHAMPIONS
            </Link>

            {/* Nav — Desktop */}
            <nav
                style={{
                    display: 'flex',
                    gap: '2.5rem',
                    alignItems: 'center',
                }}
                className="hidden md:flex"
            >
                {['SHOP', 'ABOUT'].map(link => (
                    <Link
                        key={link}
                        to={`/${link.toLowerCase()}`}
                        style={{
                            fontSize: '0.6875rem',
                            letterSpacing: '0.15em',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            opacity: location.pathname === `/${link.toLowerCase()}` ? 1 : 0.6,
                            transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => {
                            if (location.pathname !== `/${link.toLowerCase()}`) {
                                e.currentTarget.style.opacity = '0.6'
                            }
                        }}
                    >
                        {link}
                    </Link>
                ))}
                <Link
                    to={user ? '/account' : '/sign-in'}
                    style={{
                        fontSize: '0.6875rem',
                        letterSpacing: '0.15em',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        opacity: ['/account', '/sign-in'].includes(location.pathname) ? 1 : 0.6,
                        transition: 'opacity 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => {
                        if (!['/account', '/sign-in'].includes(location.pathname)) {
                            e.currentTarget.style.opacity = '0.6'
                        }
                    }}
                >
                    {user ? 'ACCOUNT' : 'SIGN IN'}
                </Link>
            </nav>

            {/* Right: Cart + Mobile Hamburger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <button
                    onClick={toggleCart}
                    style={{
                        position: 'relative',
                        fontSize: '0.6875rem',
                        letterSpacing: '0.15em',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    BAG
                    <AnimatePresence>
                        {itemCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                style={{
                                    marginLeft: '0.25rem',
                                    fontSize: '0.625rem',
                                    opacity: 0.6,
                                }}
                            >
                                ({itemCount})
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
                        {['SHOP', 'ABOUT'].map((link, i) => (
                            <motion.div
                                key={link}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                            >
                                <Link
                                    to={`/${link.toLowerCase()}`}
                                    style={{
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.2em',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {link}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
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
