import { useState } from 'react'
import { useAuth, type OAuthProvider } from '@/context/AuthContext'
import { trackEvent } from '@/lib/analytics'

const PROVIDERS: { id: OAuthProvider; label: string }[] = [
    { id: 'google', label: 'GOOGLE' },
    { id: 'facebook', label: 'FACEBOOK' },
    { id: 'discord', label: 'DISCORD' },
]

export default function OAuthButtons({ mode }: { mode: 'sign_in' | 'sign_up' }) {
    const { signInWithOAuth } = useAuth()
    const [pending, setPending] = useState<OAuthProvider | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleClick = async (id: OAuthProvider) => {
        setPending(id)
        setError(null)
        trackEvent(mode === 'sign_up' ? 'sign_up' : 'login', { method: id })
        const { error } = await signInWithOAuth(id)
        if (error) {
            setError(error.message)
            setPending(null)
        }
        // Success path: Supabase performs a full-page redirect; component unmounts.
    }

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
            }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.06)' }} />
                <span style={{
                    fontSize: '0.625rem',
                    letterSpacing: '0.2em',
                    color: 'var(--color-gray-400)',
                    textTransform: 'uppercase',
                }}>
                    Or
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0,0,0,0.06)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {PROVIDERS.map(p => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => handleClick(p.id)}
                        disabled={pending !== null}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            border: '1px solid var(--color-black)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-black)',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            cursor: pending ? 'wait' : 'pointer',
                            opacity: pending && pending !== p.id ? 0.4 : 1,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {pending === p.id ? 'REDIRECTING...' : `CONTINUE WITH ${p.label}`}
                    </button>
                ))}
            </div>

            {error && (
                <p style={{
                    marginTop: '0.75rem',
                    fontSize: '0.6875rem',
                    color: '#dc2626',
                    letterSpacing: '0.05em',
                }}>
                    {error}
                </p>
            )}
        </div>
    )
}
