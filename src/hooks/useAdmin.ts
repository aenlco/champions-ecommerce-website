import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function useAdmin() {
    const { user, loading: authLoading } = useAuth()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            setIsAdmin(false)
            setLoading(false)
            return
        }

        async function checkAdmin() {
            const { data } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user!.id)
                .single()

            setIsAdmin(data?.is_admin === true)
            setLoading(false)
        }

        checkAdmin()
    }, [user, authLoading])

    return { isAdmin, loading: loading || authLoading }
}
