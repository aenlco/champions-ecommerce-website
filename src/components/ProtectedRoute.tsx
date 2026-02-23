import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <span style={{
                    fontSize: '0.625rem',
                    letterSpacing: '0.2em',
                    color: 'var(--color-gray-400)',
                    textTransform: 'uppercase',
                }}>
                    Loading...
                </span>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/sign-in" replace />
    }

    return <>{children}</>
}
