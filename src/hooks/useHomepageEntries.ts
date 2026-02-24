import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { HomepageEntry } from '@/lib/types'

export function useHomepageEntries() {
    const [entries, setEntries] = useState<HomepageEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEntries = useCallback(async () => {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('homepage_entries')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

        if (err) {
            setError(err.message)
        } else {
            setEntries(data || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchEntries()
    }, [fetchEntries])

    return { entries, loading, error, refetch: fetchEntries }
}

export function useAdminHomepageEntries() {
    const [entries, setEntries] = useState<HomepageEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEntries = useCallback(async () => {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('homepage_entries')
            .select('*')
            .order('sort_order', { ascending: true })

        if (err) {
            setError(err.message)
        } else {
            setEntries(data || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchEntries()
    }, [fetchEntries])

    const createEntry = async (entry: Omit<HomepageEntry, 'id' | 'created_at' | 'updated_at'>) => {
        const { data, error: err } = await supabase
            .from('homepage_entries')
            .insert(entry)
            .select()
            .single()

        if (err) throw err
        await fetchEntries()
        return data
    }

    const updateEntry = async (id: string, updates: Partial<HomepageEntry>) => {
        const { error: err } = await supabase
            .from('homepage_entries')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (err) throw err
        await fetchEntries()
    }

    const deleteEntry = async (id: string) => {
        const { error: err } = await supabase
            .from('homepage_entries')
            .delete()
            .eq('id', id)

        if (err) throw err
        await fetchEntries()
    }

    return { entries, loading, error, createEntry, updateEntry, deleteEntry, refetch: fetchEntries }
}
