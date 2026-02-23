import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function SignUp() {
    const navigate = useNavigate()
    const { signUpWithEmail } = useAuth()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await signUpWithEmail(email, password)
        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        // Create profile row
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('profiles').insert({
                id: user.id,
                full_name: fullName,
                email: email,
            })
        }

        navigate('/account')
    }

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
                        Create Account
                    </h1>

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

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                required
                                style={inputStyle}
                            />
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
                                minLength={6}
                                style={inputStyle}
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
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
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </button>
                    </form>

                    <p style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        fontSize: '0.6875rem',
                        color: 'var(--color-gray-500)',
                        letterSpacing: '0.05em',
                    }}>
                        Already have an account?{' '}
                        <Link
                            to="/sign-in"
                            style={{
                                color: 'var(--color-black)',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                                fontWeight: 500,
                            }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    )
}
