import { Navigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading } = useAdmin()

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

    if (!isAdmin) {
        return <Navigate to="/sign-in" replace />
    }

    return <>{children}</>
}
