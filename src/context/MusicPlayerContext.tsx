import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

export interface PlayerTrack {
    id: string
    title: string
    artist: string
    audio_url: string
}

type PlayerTheme = 'dark' | 'light'

interface MusicPlayerState {
    tracks: PlayerTrack[]
    currentIndex: number
    isPlaying: boolean
    isVisible: boolean
    isMinimized: boolean
    currentTime: number
    duration: number
    volume: number
    embedUrl: string | null
    mode: 'tracks' | 'embed'
    theme: PlayerTheme
}

interface MusicPlayerContextType extends MusicPlayerState {
    audioRef: React.RefObject<HTMLAudioElement | null>
    setTracks: (tracks: PlayerTrack[]) => void
    setEmbedUrl: (url: string | null) => void
    play: (index?: number) => void
    pause: () => void
    togglePlay: () => void
    next: () => void
    prev: () => void
    seek: (time: number) => void
    setVolume: (vol: number) => void
    show: () => void
    hide: () => void
    close: () => void
    toggleVisibility: () => void
    minimize: () => void
    expand: () => void
    toggleTheme: () => void
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null)

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const currentSrcRef = useRef<string>('')
    const [tracks, setTracksState] = useState<PlayerTrack[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isVisible, setIsVisible] = useState(() => {
        const saved = localStorage.getItem('ck-player-visible')
        return saved === null ? false : saved === 'true'
    })
    const [isMinimized, setIsMinimized] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolumeState] = useState(() => {
        const saved = localStorage.getItem('ck-player-volume')
        return saved ? parseFloat(saved) : 0.7
    })
    const [embedUrl, setEmbedUrlState] = useState<string | null>(null)
    const [mode, setMode] = useState<'tracks' | 'embed'>('tracks')
    const [theme, setTheme] = useState<PlayerTheme>(() => {
        const saved = localStorage.getItem('ck-player-theme')
        return (saved === 'light' || saved === 'dark') ? saved : 'dark'
    })

    // Persist visibility
    useEffect(() => {
        localStorage.setItem('ck-player-visible', String(isVisible))
    }, [isVisible])

    // Persist volume
    useEffect(() => {
        localStorage.setItem('ck-player-volume', String(volume))
    }, [volume])

    // Persist theme
    useEffect(() => {
        localStorage.setItem('ck-player-theme', theme)
    }, [theme])

    // Audio time update
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const onTimeUpdate = () => setCurrentTime(audio.currentTime)
        const onDurationChange = () => setDuration(audio.duration || 0)
        const onEnded = () => {
            if (currentIndex < tracks.length - 1) {
                setCurrentIndex(prev => prev + 1)
            } else {
                setIsPlaying(false)
            }
        }

        audio.addEventListener('timeupdate', onTimeUpdate)
        audio.addEventListener('durationchange', onDurationChange)
        audio.addEventListener('ended', onEnded)

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate)
            audio.removeEventListener('durationchange', onDurationChange)
            audio.removeEventListener('ended', onEnded)
        }
    }, [currentIndex, tracks.length])

    // Load track when index changes — only if the src actually changed
    useEffect(() => {
        const audio = audioRef.current
        if (!audio || tracks.length === 0 || mode !== 'tracks') return

        const track = tracks[currentIndex]
        if (!track) return

        // Skip if already playing this track
        if (currentSrcRef.current === track.audio_url) return

        currentSrcRef.current = track.audio_url
        audio.src = track.audio_url
        audio.volume = volume
        if (isPlaying) {
            audio.play().catch(() => {})
        }
    }, [currentIndex, tracks, mode])

    // Apply volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    const setTracks = useCallback((newTracks: PlayerTrack[]) => {
        setTracksState(prev => {
            // Skip if same tracks already loaded (compare IDs)
            if (
                prev.length === newTracks.length &&
                prev.every((t, i) => t.id === newTracks[i].id && t.audio_url === newTracks[i].audio_url)
            ) {
                return prev
            }
            // Only reset index when tracks actually change
            setCurrentIndex(0)
            return newTracks
        })
        setMode('tracks')
        if (newTracks.length > 0) {
            setIsVisible(true)
        }
    }, [])

    const setEmbedUrl = useCallback((url: string | null) => {
        setEmbedUrlState(prev => {
            if (prev === url) return prev
            return url
        })
        if (url) {
            setMode('embed')
            setIsVisible(true)
            // Pause native audio if switching to embed
            if (audioRef.current) {
                audioRef.current.pause()
                setIsPlaying(false)
            }
        } else {
            setMode('tracks')
        }
    }, [])

    const play = useCallback((index?: number) => {
        if (index !== undefined) setCurrentIndex(index)
        const audio = audioRef.current
        if (audio && mode === 'tracks') {
            audio.play().catch(() => {})
        }
        setIsPlaying(true)
    }, [mode])

    const pause = useCallback(() => {
        audioRef.current?.pause()
        setIsPlaying(false)
    }, [])

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause()
        } else {
            play()
        }
    }, [isPlaying, play, pause])

    const next = useCallback(() => {
        if (tracks.length === 0) return
        currentSrcRef.current = '' // Force reload on next
        setCurrentIndex(prev => (prev + 1) % tracks.length)
    }, [tracks.length])

    const prev = useCallback(() => {
        if (tracks.length === 0) return
        const audio = audioRef.current
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0
            return
        }
        currentSrcRef.current = '' // Force reload on prev
        setCurrentIndex(prev => (prev - 1 + tracks.length) % tracks.length)
    }, [tracks.length])

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time
        }
    }, [])

    const setVolume = useCallback((vol: number) => {
        setVolumeState(Math.max(0, Math.min(1, vol)))
    }, [])

    const show = useCallback(() => setIsVisible(true), [])
    // Hide = just hide the UI, music keeps playing
    const hide = useCallback(() => {
        setIsVisible(false)
    }, [])
    // Close = stop playback and hide
    const close = useCallback(() => {
        setIsVisible(false)
        audioRef.current?.pause()
        setIsPlaying(false)
    }, [])
    const toggleVisibility = useCallback(() => {
        if (isVisible) {
            hide()
        } else {
            show()
        }
    }, [isVisible, hide, show])
    const minimize = useCallback(() => setIsMinimized(true), [])
    const expand = useCallback(() => setIsMinimized(false), [])
    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }, [])

    return (
        <MusicPlayerContext.Provider value={{
            tracks, currentIndex, isPlaying, isVisible, isMinimized,
            currentTime, duration, volume, embedUrl, mode, theme, audioRef,
            setTracks, setEmbedUrl, play, pause, togglePlay,
            next, prev, seek, setVolume,
            show, hide, close, toggleVisibility, minimize, expand, toggleTheme,
        }}>
            <audio ref={audioRef} preload="metadata" />
            {children}
        </MusicPlayerContext.Provider>
    )
}

export function useMusicPlayer() {
    const ctx = useContext(MusicPlayerContext)
    if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider')
    return ctx
}
