import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { useAuth } from '@/context/AuthContext'

type AuthMode = 'email' | 'phone'

export default function SignIn() {
    const navigate = useNavigate()
    const { signInWithEmail, signInWithPhone, verifyOtp } = useAuth()

    const [mode, setMode] = useState<AuthMode>('email')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Email state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Phone state
    const [phone, setPhone] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [otpCode, setOtpCode] = useState('')

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await signInWithEmail(email, password)
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/account')
        }
    }

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await signInWithPhone(phone)
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setOtpSent(true)
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await verifyOtp(phone, otpCode)
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/account')
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid rgba(0,0,0,0.12)',
        fontSize: '0.75rem',
        letterSpacing: '0.05em',
        backgroundColor: 'transparent',
    }

    const tabStyle = (active: boolean): React.CSSProperties => ({
        fontSize: '0.625rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        fontWeight: 600,
        padding: '0.75rem 0',
        borderBottom: active ? '1.5px solid var(--color-black)' : '1.5px solid transparent',
        opacity: active ? 1 : 0.4,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    })

    return (
        <PageTransition>
            <div style={{
                paddingTop: '100px',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 'clamp(1.5rem, 4vw, 3rem)',
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <h1 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginBottom: '2rem',
                        textAlign: 'center',
                    }}>
                        Sign In
                    </h1>

                    {/* Mode Toggle */}
                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        justifyContent: 'center',
                        marginBottom: '2rem',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }}>
                        <button onClick={() => { setMode('email'); setError(null) }} style={tabStyle(mode === 'email')}>
                            EMAIL
                        </button>
                        <button onClick={() => { setMode('phone'); setError(null) }} style={tabStyle(mode === 'phone')}>
                            PHONE
                        </button>
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(220,38,38,0.2)',
                            backgroundColor: 'rgba(220,38,38,0.04)',
                        }}>
                            <p style={{ fontSize: '0.6875rem', color: '#dc2626', letterSpacing: '0.05em' }}>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Email Form */}
                    {mode === 'email' && (
                        <form onSubmit={handleEmailSignIn}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-black)',
                                    color: 'var(--color-white)',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? 'wait' : 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {loading ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>
                        </form>
                    )}

                    {/* Phone Form */}
                    {mode === 'phone' && !otpSent && (
                        <form onSubmit={handleSendOtp}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="tel"
                                    placeholder="Phone Number (e.g. +1234567890)"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-black)',
                                    color: 'var(--color-white)',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? 'wait' : 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {loading ? 'SENDING CODE...' : 'SEND CODE'}
                            </button>
                        </form>
                    )}

                    {/* OTP Verification */}
                    {mode === 'phone' && otpSent && (
                        <form onSubmit={handleVerifyOtp}>
                            <p style={{
                                fontSize: '0.6875rem',
                                color: 'var(--color-gray-500)',
                                marginBottom: '1rem',
                                letterSpacing: '0.05em',
                            }}>
                                A verification code has been sent to {phone}
                            </p>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={otpCode}
                                    onChange={e => setOtpCode(e.target.value)}
                                    required
                                    maxLength={6}
                                    style={inputStyle}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-black)',
                                    color: 'var(--color-white)',
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? 'wait' : 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {loading ? 'VERIFYING...' : 'VERIFY'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setOtpSent(false); setOtpCode('') }}
                                style={{
                                    width: '100%',
                                    marginTop: '0.75rem',
                                    padding: '0.75rem',
                                    fontSize: '0.625rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: 'var(--color-gray-500)',
                                }}
                            >
                                USE A DIFFERENT NUMBER
                            </button>
                        </form>
                    )}

                    <p style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        fontSize: '0.6875rem',
                        color: 'var(--color-gray-500)',
                        letterSpacing: '0.05em',
                    }}>
                        Don't have an account?{' '}
                        <Link
                            to="/sign-up"
                            style={{
                                color: 'var(--color-black)',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                                fontWeight: 500,
                            }}
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    )
}
