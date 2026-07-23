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

const PLAYBACK_KEY = 'ck-player-playback'

interface SavedPlayback {
    trackId: string
    currentTime: number
    isPlaying: boolean
}

function readSavedPlayback(): SavedPlayback | null {
    try {
        const raw = localStorage.getItem(PLAYBACK_KEY)
        if (!raw) return null
        const p = JSON.parse(raw)
        if (typeof p?.trackId !== 'string' || !p.trackId) return null
        return { trackId: p.trackId, currentTime: Number(p.currentTime) || 0, isPlaying: !!p.isPlaying }
    } catch {
        return null
    }
}

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const currentSrcRef = useRef<string>('')
    // Playback restore across full page reloads (leave & return to the site)
    const savedPlaybackRef = useRef<SavedPlayback | null>(readSavedPlayback())
    const resumeRef = useRef<{ time: number; play: boolean } | null>(null)
    const tracksRef = useRef<PlayerTrack[]>([])
    const snapshotRef = useRef<SavedPlayback>({ trackId: '', currentTime: 0, isPlaying: false })
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
        return (saved === 'light' || saved === 'dark') ? saved : 'light'
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

    // Keep tracks mirror + a live snapshot for playback persistence (cheap, every render)
    useEffect(() => { tracksRef.current = tracks })
    snapshotRef.current = {
        trackId: tracks[currentIndex]?.id || '',
        currentTime,
        isPlaying,
    }

    const persistPlayback = useCallback(() => {
        const s = snapshotRef.current
        if (!s.trackId) return
        try { localStorage.setItem(PLAYBACK_KEY, JSON.stringify(s)) } catch { /* ignore quota */ }
    }, [])

    // Resume playback on the first user gesture when the browser blocks autoplay
    const armGestureResume = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        const onGesture = () => {
            audio.play().then(() => setIsPlaying(true)).catch(() => {})
            cleanup()
        }
        const cleanup = () => {
            document.removeEventListener('pointerdown', onGesture)
            document.removeEventListener('keydown', onGesture)
            document.removeEventListener('touchstart', onGesture)
        }
        document.addEventListener('pointerdown', onGesture)
        document.addEventListener('keydown', onGesture)
        document.addEventListener('touchstart', onGesture)
    }, [])

    // Persist on play/pause and track change, periodically while playing, and on page hide
    useEffect(() => { persistPlayback() }, [isPlaying, currentIndex, persistPlayback])
    useEffect(() => {
        if (!isPlaying) return
        const id = setInterval(persistPlayback, 5000)
        return () => clearInterval(id)
    }, [isPlaying, persistPlayback])
    useEffect(() => {
        const onHide = () => persistPlayback()
        const onVisibility = () => { if (document.visibilityState === 'hidden') persistPlayback() }
        window.addEventListener('pagehide', onHide)
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            window.removeEventListener('pagehide', onHide)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [persistPlayback])

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

        // Restoring from a previous session: seek to the saved position and
        // resume if it was playing (falling back to a user gesture if the
        // browser blocks autoplay on a fresh page load).
        const resume = resumeRef.current
        if (resume) {
            resumeRef.current = null
            const applyResume = () => {
                if (resume.time > 0) {
                    try { audio.currentTime = resume.time } catch { /* not seekable yet */ }
                }
                if (resume.play) {
                    audio.play().then(() => setIsPlaying(true)).catch(() => armGestureResume())
                }
            }
            if (audio.readyState >= 1) applyResume()
            else audio.addEventListener('loadedmetadata', applyResume, { once: true })
            return
        }

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
        const prev = tracksRef.current
        const same =
            prev.length === newTracks.length &&
            prev.every((t, i) => t.id === newTracks[i].id && t.audio_url === newTracks[i].audio_url)

        if (!same) {
            setTracksState(newTracks)

            // Restore the previously playing track (across a full page reload)
            const saved = savedPlaybackRef.current
            const savedIdx = saved ? newTracks.findIndex(t => t.id === saved.trackId) : -1
            if (saved && savedIdx >= 0) {
                setCurrentIndex(savedIdx)
                resumeRef.current = { time: saved.currentTime, play: saved.isPlaying }
            } else {
                setCurrentIndex(0)
            }
            savedPlaybackRef.current = null // consume once
        }

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
    // Close = stop playback and hide, and forget the saved session
    const close = useCallback(() => {
        setIsVisible(false)
        audioRef.current?.pause()
        setIsPlaying(false)
        try { localStorage.removeItem(PLAYBACK_KEY) } catch { /* ignore */ }
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
