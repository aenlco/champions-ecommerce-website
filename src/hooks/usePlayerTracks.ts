import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface PlayerTrackRow {
    id: string
    title: string
    artist: string
    audio_url: string
    sort_order: number
    is_active: boolean
    created_at: string
}

export interface PlayerConfig {
    mode: 'tracks' | 'embed'
    embed_url: string | null
    is_enabled: boolean
}

export function usePlayerTracks() {
    const [tracks, setTracks] = useState<PlayerTrackRow[]>([])
    const [config, setConfig] = useState<PlayerConfig>({ mode: 'tracks', embed_url: null, is_enabled: false })
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        const [tracksRes, configRes] = await Promise.all([
            supabase
                .from('player_tracks')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true }),
            supabase
                .from('site_settings')
                .select('key, value')
                .in('key', ['player_mode', 'player_embed_url', 'player_enabled']),
        ])

        setTracks(tracksRes.data || [])

        const settings = configRes.data || []
        const getVal = (key: string) => settings.find(s => s.key === key)?.value
        setConfig({
            mode: (getVal('player_mode') as 'tracks' | 'embed') || 'tracks',
            embed_url: getVal('player_embed_url') || null,
            is_enabled: getVal('player_enabled') === 'true',
        })

        setLoading(false)
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { tracks, config, loading, refetch: fetchData }
}

export function useAdminPlayerTracks() {
    const [tracks, setTracks] = useState<PlayerTrackRow[]>([])
    const [config, setConfig] = useState<PlayerConfig>({ mode: 'tracks', embed_url: null, is_enabled: false })
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        const [tracksRes, configRes] = await Promise.all([
            supabase
                .from('player_tracks')
                .select('*')
                .order('sort_order', { ascending: true }),
            supabase
                .from('site_settings')
                .select('key, value')
                .in('key', ['player_mode', 'player_embed_url', 'player_enabled']),
        ])

        setTracks(tracksRes.data || [])

        const settings = configRes.data || []
        const getVal = (key: string) => settings.find(s => s.key === key)?.value
        setConfig({
            mode: (getVal('player_mode') as 'tracks' | 'embed') || 'tracks',
            embed_url: getVal('player_embed_url') || null,
            is_enabled: getVal('player_enabled') === 'true',
        })

        setLoading(false)
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const addTrack = async (track: Omit<PlayerTrackRow, 'id' | 'created_at'>) => {
        const { error } = await supabase.from('player_tracks').insert(track)
        if (error) throw error
        await fetchData()
    }

    const updateTrack = async (id: string, updates: Partial<PlayerTrackRow>) => {
        const { error } = await supabase.from('player_tracks').update(updates).eq('id', id)
        if (error) throw error
        await fetchData()
    }

    const deleteTrack = async (id: string) => {
        const { error } = await supabase.from('player_tracks').delete().eq('id', id)
        if (error) throw error
        await fetchData()
    }

    const updateConfig = async (key: string, value: string) => {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key, value }, { onConflict: 'key' })
        if (error) throw error
        await fetchData()
    }

    return {
        tracks, config, loading, refetch: fetchData,
        addTrack, updateTrack, deleteTrack, updateConfig,
    }
}
