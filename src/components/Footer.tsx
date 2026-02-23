import { Link } from 'react-router-dom'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer
            style={{
                borderTop: '1px solid rgba(0,0,0,0.06)',
                padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}
            >
                {/* Brand */}
                <div>
                    <img src="/logo.png" alt="Charles K" style={{ height: '24px', width: 'auto', marginBottom: '1rem' }} />
                    <p style={{ fontSize: '0.6875rem', color: 'var(--color-gray-500)', lineHeight: 1.8 }}>
                        Built for those who compete<br />with themselves.
                    </p>
                </div>

                {/* Navigation */}
                <div>
                    <p className="text-label" style={{ marginBottom: '1rem', color: 'var(--color-gray-500)' }}>
                        Navigate
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {[
                            { label: 'Shop', to: '/shop' },
                            { label: 'About', to: '/about' },
                        ].map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                style={{
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.05em',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Legal */}
                <div>
                    <p className="text-label" style={{ marginBottom: '1rem', color: 'var(--color-gray-500)' }}>
                        Legal
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {['Privacy Policy', 'Terms of Service', 'Shipping & Returns'].map(text => (
                            <span
                                key={text}
                                style={{
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.05em',
                                    color: 'var(--color-gray-500)',
                                    cursor: 'pointer',
                                }}
                            >
                                {text}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Social */}
                <div>
                    <p className="text-label" style={{ marginBottom: '1rem', color: 'var(--color-gray-500)' }}>
                        Follow
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {['Instagram', 'Twitter / X'].map(text => (
                            <span
                                key={text}
                                style={{
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div
                style={{
                    marginTop: 'clamp(2rem, 4vw, 3rem)',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(0,0,0,0.04)',
                    textAlign: 'center',
                }}
            >
                <p style={{ fontSize: '0.625rem', letterSpacing: '0.1em', color: 'var(--color-gray-400)' }}>
                    © {year} CHARLES K. ALL RIGHTS RESERVED.
                </p>
            </div>
        </footer>
    )
}
