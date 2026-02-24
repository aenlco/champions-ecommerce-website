import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

export default function Home() {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 100)
        return () => clearTimeout(t)
    }, [])

    return (
        <PageTransition>
            {/* Hero */}
            <section
                style={{
                    position: 'relative',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-gray-50)',
                }}
            >
                {/* Background pattern — subtle grid */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
              linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)
            `,
                        backgroundSize: '60px 60px',
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 40 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
                >
                    <img
                        src="/logo.png"
                        alt="Charles K"
                        style={{
                            height: 'clamp(4rem, 14vw, 10rem)',
                            width: 'auto',
                            margin: '0 auto',
                        }}
                    />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: loaded ? 0.5 : 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        style={{
                            marginTop: '1.5rem',
                            fontSize: '0.6875rem',
                            letterSpacing: '0.25em',
                            textTransform: 'uppercase',
                            fontWeight: 400,
                        }}
                    >
                        Built for those who compete with themselves
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 10 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        style={{ marginTop: '3rem' }}
                    >
                        <Link
                            to="/shop"
                            style={{
                                display: 'inline-block',
                                padding: '0.875rem 2.5rem',
                                border: '1px solid var(--color-black)',
                                fontSize: '0.6875rem',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
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
                            SHOP NOW
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <span style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                        style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-black)' }}
                    />
                </motion.div>
            </section>

            {/* Featured Section */}
            <section
                style={{
                    padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 4vw, 3rem)',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3rem' }}>
                    <h2
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Featured
                    </h2>
                    <Link
                        to="/shop"
                        style={{
                            fontSize: '0.625rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            opacity: 0.5,
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                        }}
                    >
                        View All
                    </Link>
                </div>

                {/* Placeholder grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem',
                    }}
                >
                    {[1, 2, 3].map(i => (
                        <Link to="/shop" key={i}>
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
                                                fontSize: '0.625rem',
                                                letterSpacing: '0.2em',
                                                color: 'var(--color-gray-300)',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            Coming Soon
                                        </span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                                    Essential {i === 1 ? 'Tee' : i === 2 ? 'Hoodie' : 'Shorts'}
                                </p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>
                                    ${i === 1 ? '48' : i === 2 ? '128' : '68'}.00
                                </p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Ethos Banner */}
            <section
                style={{
                    padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 4vw, 3rem)',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(0,0,0,0.04)',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                }}
            >
                <p
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                        fontWeight: 400,
                        lineHeight: 1.8,
                        maxWidth: '600px',
                        margin: '0 auto',
                        letterSpacing: '0.05em',
                    }}
                >
                    "The only competition<br />worth having is the one<br />with yourself."
                </p>
            </section>
        </PageTransition>
    )
}
