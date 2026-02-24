import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

interface Entry {
    date: string
    title: string
    type: 'video' | 'image' | 'article' | 'link'
    media?: string
    description?: string
    externalUrl?: string
}

const ENTRIES: Entry[] = [
    {
        date: '25-07-31',
        title: 'Project 3 Agency',
        type: 'video',
        media: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
        date: '25-06-28',
        title: 'Dave Free for Bottega Veneta.',
        type: 'image',
        media: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    },
    {
        date: '25-06-25',
        title: 'lose.',
        type: 'link',
        description: 'A new single exploring loss and redemption.',
        externalUrl: '#',
    },
    {
        date: '25-04-22',
        title: 'Kendrick Lamar for Chanel.',
        type: 'image',
        media: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    },
    {
        date: '25-04-18',
        title: 'Grand National Tour.',
        type: 'article',
        description: 'Announcing dates for the Grand National Tour. Tickets available now.',
        externalUrl: '#',
    },
    {
        date: '25-04-11',
        title: 'lather.',
        type: 'link',
        description: 'Stream now on all platforms.',
        externalUrl: '#',
    },
    {
        date: '25-03-18',
        title: 'Most Innovative Companies 2025.',
        type: 'link',
        externalUrl: '#',
    },
    {
        date: '25-02-09',
        title: 'Super Bowl LIX Halftime Show. Highest rated in history.',
        type: 'video',
        media: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
        date: '25-02-02',
        title: "Dave Free wins Grammy for 'Not Like Us'.",
        type: 'image',
        media: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    },
    {
        date: '25-02-02',
        title: "Kendrick Lamar wins 5 Grammys for 'Not Like Us'.",
        type: 'link',
        externalUrl: '#',
    },
    {
        date: '24-11-25',
        title: 'squabble up.',
        type: 'link',
        externalUrl: '#',
    },
    {
        date: '24-11-22',
        title: 'GNX.',
        type: 'link',
        externalUrl: '#',
    },
    {
        date: '24-08-08',
        title: 'Super Bowl LIX. New Orleans. February 2025.',
        type: 'link',
        externalUrl: '#',
    },
]

export default function HomeNew() {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
    const { itemCount, toggleCart } = useCart()
    const { user } = useAuth()

    const toggle = (i: number) => {
        setExpandedIndex(prev => (prev === i ? null : i))
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: 'var(--color-gray-50)',
                padding: 'clamp(1.5rem, 4vw, 3rem)',
            }}
        >
            {/* Top bar: Logo left, Icons right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(2rem, 5vw, 4rem)' }}>
                <Link to="/" style={{ display: 'inline-block' }}>
                    <img src="/logo.png" alt="Charles K" style={{ height: '25px', width: 'auto' }} />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {/* Shop triangle */}
                    <Link
                        to="/shop"
                        style={{ display: 'flex', alignItems: 'center', opacity: 0.6, transition: 'opacity 0.2s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                        aria-label="Shop"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                            <polygon points="12,3 22,21 2,21" />
                        </svg>
                    </Link>

                    {/* Profile */}
                    <Link
                        to={user ? '/account' : '/sign-in'}
                        style={{ display: 'flex', alignItems: 'center', opacity: 0.6, transition: 'opacity 0.2s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                        aria-label={user ? 'Account' : 'Sign in'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </Link>

                    {/* Bag */}
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
                </div>
            </div>

            {/* Entry List */}
            <div style={{ maxWidth: '900px' }}>
                {ENTRIES.map((entry, i) => (
                    <div key={`${entry.date}-${i}`}>
                        <div
                            onClick={() => toggle(i)}
                            style={{
                                display: 'flex',
                                gap: 'clamp(1.5rem, 4vw, 3rem)',
                                padding: '0.625rem 0',
                                cursor: 'pointer',
                                alignItems: 'baseline',
                            }}
                            onMouseEnter={e => {
                                const title = e.currentTarget.querySelector('[data-title]') as HTMLElement
                                if (title) title.style.textDecoration = 'underline'
                            }}
                            onMouseLeave={e => {
                                const title = e.currentTarget.querySelector('[data-title]') as HTMLElement
                                if (title) title.style.textDecoration = 'none'
                            }}
                        >
                            {/* Date */}
                            <span
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.6875rem',
                                    color: 'var(--color-gray-400)',
                                    flexShrink: 0,
                                    width: '70px',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {entry.date}
                            </span>

                            {/* Title */}
                            <span
                                data-title
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.8125rem',
                                    color: 'var(--color-black)',
                                    textDecoration: expandedIndex === i ? 'underline' : 'none',
                                    textUnderlineOffset: '3px',
                                    lineHeight: 1.5,
                                }}
                            >
                                {entry.title}
                            </span>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expandedIndex === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    style={{ overflow: 'hidden', paddingLeft: 'calc(70px + clamp(1.5rem, 4vw, 3rem))' }}
                                >
                                    <div style={{ paddingBottom: '1.5rem', paddingTop: '0.5rem' }}>
                                        {entry.type === 'video' && entry.media && (
                                            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, maxWidth: '600px' }}>
                                                <iframe
                                                    src={entry.media}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        border: 'none',
                                                    }}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        )}

                                        {entry.type === 'image' && entry.media && (
                                            <img
                                                src={entry.media}
                                                alt={entry.title}
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '600px',
                                                    height: 'auto',
                                                    display: 'block',
                                                }}
                                            />
                                        )}

                                        {(entry.type === 'article' || entry.type === 'link') && (
                                            <div>
                                                {entry.description && (
                                                    <p style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--color-gray-500)',
                                                        lineHeight: 1.7,
                                                        marginBottom: entry.externalUrl ? '0.75rem' : 0,
                                                    }}>
                                                        {entry.description}
                                                    </p>
                                                )}
                                                {entry.externalUrl && (
                                                    <a
                                                        href={entry.externalUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            fontSize: '0.6875rem',
                                                            textDecoration: 'underline',
                                                            textUnderlineOffset: '3px',
                                                            color: 'var(--color-black)',
                                                        }}
                                                    >
                                                        View &rarr;
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    )
}
