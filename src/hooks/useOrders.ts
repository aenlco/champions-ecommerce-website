import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'

export function useOrders() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setOrders([])
            setLoading(false)
            return
        }

        async function fetchOrders() {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false })

            setOrders(data || [])
            setLoading(false)
        }

        fetchOrders()
    }, [user])

    return { orders, loading }
}
