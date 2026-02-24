import { useEffect, useRef, useState } from 'react'
import { useMusicPlayer } from '@/context/MusicPlayerContext'
import { usePlayerTracks } from '@/hooks/usePlayerTracks'
import { AnimatePresence, motion } from 'framer-motion'

function getMusicEmbedUrl(url: string): { src: string; height: string } {
    if (url.includes('open.spotify.com') && !url.includes('/embed/')) {
        return { src: url.replace('open.spotify.com/', 'open.spotify.com/embed/'), height: '80px' }
    }
    if (url.includes('open.spotify.com/embed/')) {
        return { src: url, height: '80px' }
    }
    if (url.includes('soundcloud.com') && !url.includes('w.soundcloud.com/player')) {
        const cleanUrl = url.split('?')[0]
        return { src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanUrl)}&color=%23000000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`, height: '80px' }
    }
    if (url.includes('w.soundcloud.com/player')) {
        return { src: url, height: '80px' }
    }
    if (url.includes('music.apple.com') && !url.includes('embed.music.apple.com')) {
        return { src: url.replace('music.apple.com', 'embed.music.apple.com'), height: '52px' }
    }
    if (url.includes('embed.music.apple.com')) {
        return { src: url, height: '52px' }
    }
    if (url.includes('tidal.com/browse/')) {
        const trackId = url.match(/(?:track|album|playlist)\/(\w+)/)?.[1]
        const type = url.includes('/track/') ? 'tracks' : url.includes('/album/') ? 'albums' : 'playlists'
        if (trackId) return { src: `https://embed.tidal.com/${type}/${trackId}`, height: '80px' }
    }
    if (url.includes('embed.tidal.com')) {
        return { src: url, height: '80px' }
    }
    return { src: url, height: '80px' }
}

function formatTime(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

const THEMES = {
    dark: {
        bg: 'var(--color-black)',
        text: 'var(--color-white)',
        border: 'rgba(255,255,255,0.08)',
        progressBg: 'rgba(255,255,255,0.1)',
        progressFill: 'var(--color-white)',
        controlBorder: 'rgba(255,255,255,0.3)',
        muted: 'rgba(255,255,255,0.5)',
        accent: 'var(--color-white)',
        tabBg: 'var(--color-black)',
    },
    light: {
        bg: '#e8e8e8',
        text: 'var(--color-black)',
        border: 'rgba(0,0,0,0.08)',
        progressBg: 'rgba(0,0,0,0.1)',
        progressFill: 'var(--color-black)',
        controlBorder: 'rgba(0,0,0,0.25)',
        muted: 'rgba(0,0,0,0.4)',
        accent: 'var(--color-black)',
        tabBg: '#e8e8e8',
    },
}

export default function MusicPlayer() {
    const {
        tracks: playerTracks, currentIndex, isPlaying, isVisible,
        currentTime, duration, mode, embedUrl, theme,
        togglePlay, next, prev, seek, setVolume, volume,
        hide, close, show, setTracks, setEmbedUrl, toggleTheme,
    } = useMusicPlayer()

    const { tracks: dbTracks, config, loading } = usePlayerTracks()
    const progressRef = useRef<HTMLDivElement>(null)
    const volumeRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isVolumeDragging, setIsVolumeDragging] = useState(false)

    const t = THEMES[theme]

    // Sync DB tracks into player context
    useEffect(() => {
        if (loading) return
        if (!config.is_enabled) return

        if (config.mode === 'embed' && config.embed_url) {
            setEmbedUrl(config.embed_url)
        } else if (config.mode === 'tracks' && dbTracks.length > 0) {
            setTracks(dbTracks.map(tr => ({
                id: tr.id,
                title: tr.title,
                artist: tr.artist,
                audio_url: tr.audio_url,
            })))
        }
    }, [dbTracks, config, loading, setTracks, setEmbedUrl])

    const currentTrack = playerTracks[currentIndex]
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0
    const hasContent = (mode === 'tracks' && playerTracks.length > 0) || (mode === 'embed' && embedUrl)
    // For embed mode, always show reopen tab when hidden (iframe manages its own playback)
    const showReopenTab = !isVisible && hasContent && (isPlaying || mode === 'embed')

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressRef.current
        if (!bar || mode !== 'tracks') return
        const rect = bar.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        seek(pct * duration)
    }

    const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return
        handleProgressClick(e)
    }

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = volumeRef.current
        if (!bar) return
        const rect = bar.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        setVolume(pct)
    }

    const handleVolumeDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isVolumeDragging) return
        handleVolumeClick(e)
    }

    useEffect(() => {
        if (!isVolumeDragging) return
        const handleUp = () => setIsVolumeDragging(false)
        window.addEventListener('mouseup', handleUp)
        return () => window.removeEventListener('mouseup', handleUp)
    }, [isVolumeDragging])

    useEffect(() => {
        if (!isDragging) return
        const handleUp = () => setIsDragging(false)
        window.addEventListener('mouseup', handleUp)
        return () => window.removeEventListener('mouseup', handleUp)
    }, [isDragging])

    if (!config.is_enabled && !loading) return null

    return (
        <>
            {/* "Now Playing" reopen tab */}
            <AnimatePresence>
                {showReopenTab && (
                    <motion.button
                        initial={{ y: 40 }}
                        animate={{ y: 0 }}
                        exit={{ y: 40 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={show}
                        style={{
                            position: 'fixed',
                            bottom: '1rem',
                            right: '1rem',
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: t.bg,
                            color: t.text,
                            fontSize: '0.5625rem',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            border: `1px solid ${t.border}`,
                        }}
                        title="Show player"
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
                        </svg>
                        Now Playing
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Main player bar */}
            <AnimatePresence>
                {isVisible && hasContent && (
                    <motion.div
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        exit={{ y: 50 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            backgroundColor: t.bg,
                            color: t.text,
                            borderTop: `1px solid ${t.border}`,
                        }}
                    >
                        {mode === 'tracks' && currentTrack && (
                            <>
                                {/* Progress bar */}
                                <div
                                    ref={progressRef}
                                    onClick={handleProgressClick}
                                    onMouseDown={() => setIsDragging(true)}
                                    onMouseMove={handleProgressDrag}
                                    onMouseUp={() => setIsDragging(false)}
                                    onMouseLeave={() => setIsDragging(false)}
                                    style={{
                                        height: '3px',
                                        backgroundColor: t.progressBg,
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                >
                                    <div style={{
                                        height: '100%',
                                        width: `${progress}%`,
                                        backgroundColor: t.progressFill,
                                        transition: isDragging ? 'none' : 'width 0.3s linear',
                                    }} />
                                </div>

                                {/* Controls — 3-column layout: left (info) | center (controls) | right (volume/actions) */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto 1fr',
                                    alignItems: 'center',
                                    padding: '0 clamp(1rem, 3vw, 2rem)',
                                    height: '44px',
                                    columnGap: 'clamp(1rem, 2vw, 2rem)',
                                }}>
                                    {/* Left: Track info + time */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                        <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                                            <p style={{
                                                fontSize: '0.625rem',
                                                fontWeight: 500,
                                                letterSpacing: '0.03em',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                margin: 0,
                                            }}>
                                                {currentTrack.title}
                                                {currentTrack.artist && (
                                                    <span style={{ opacity: 0.5, marginLeft: '0.5rem', fontWeight: 400 }}>
                                                        {currentTrack.artist}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <span style={{
                                            fontSize: '0.5rem',
                                            letterSpacing: '0.05em',
                                            opacity: 0.5,
                                            flexShrink: 0,
                                            fontFamily: 'var(--font-mono)',
                                        }}>
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>
                                    </div>

                                    {/* Center: Playback controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <button
                                            onClick={prev}
                                            style={{ color: t.text, cursor: 'pointer', opacity: 0.7, lineHeight: 0 }}
                                            title="Previous"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={togglePlay}
                                            style={{
                                                width: '28px', height: '28px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: `1px solid ${t.controlBorder}`,
                                                color: t.text,
                                                cursor: 'pointer',
                                                backgroundColor: 'transparent',
                                            }}
                                            title={isPlaying ? 'Pause' : 'Play'}
                                        >
                                            {isPlaying ? (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                                </svg>
                                            ) : (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={next}
                                            style={{ color: t.text, cursor: 'pointer', opacity: 0.7, lineHeight: 0 }}
                                            title="Next"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Right: Volume + theme + hide/close */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                        {/* Volume */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                                            <button
                                                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                                                style={{ color: t.text, cursor: 'pointer', opacity: 0.5, lineHeight: 0 }}
                                                title={volume > 0 ? 'Mute' : 'Unmute'}
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                    {volume > 0.5 ? (
                                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                                    ) : volume > 0 ? (
                                                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                                    ) : (
                                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                                    )}
                                                </svg>
                                            </button>
                                            {/* Custom volume bar */}
                                            <div
                                                ref={volumeRef}
                                                onClick={handleVolumeClick}
                                                onMouseDown={() => setIsVolumeDragging(true)}
                                                onMouseMove={handleVolumeDrag}
                                                onMouseUp={() => setIsVolumeDragging(false)}
                                                style={{
                                                    width: '56px',
                                                    height: '14px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    position: 'relative',
                                                }}
                                            >
                                                <div style={{
                                                    width: '100%',
                                                    height: '3px',
                                                    backgroundColor: t.progressBg,
                                                    position: 'relative',
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${volume * 100}%`,
                                                        backgroundColor: t.progressFill,
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: `${volume * 100}%`,
                                                        transform: 'translate(-50%, -50%)',
                                                        width: '8px',
                                                        height: '8px',
                                                        backgroundColor: t.accent,
                                                        borderRadius: '50%',
                                                    }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Theme toggle */}
                                        <button
                                            onClick={toggleTheme}
                                            style={{
                                                color: t.text,
                                                cursor: 'pointer',
                                                opacity: 0.4,
                                                lineHeight: 0,
                                                padding: '0.125rem',
                                            }}
                                            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                                        >
                                            {theme === 'dark' ? (
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                                                </svg>
                                            ) : (
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Hide (music keeps playing) */}
                                        <button
                                            onClick={hide}
                                            style={{
                                                color: t.text,
                                                cursor: 'pointer',
                                                opacity: 0.4,
                                                flexShrink: 0,
                                                padding: '0.125rem',
                                                lineHeight: 0,
                                            }}
                                            title="Hide player (music continues)"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                                            </svg>
                                        </button>

                                        {/* Close (stop music) */}
                                        <button
                                            onClick={close}
                                            style={{
                                                color: t.text,
                                                cursor: 'pointer',
                                                opacity: 0.4,
                                                flexShrink: 0,
                                                padding: '0.125rem',
                                                lineHeight: 0,
                                            }}
                                            title="Close player (stop music)"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {mode === 'embed' && embedUrl && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'relative',
                            }}>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    {(() => {
                                        const embed = getMusicEmbedUrl(embedUrl)
                                        return (
                                            <iframe
                                                src={embed.src}
                                                style={{
                                                    width: '100%',
                                                    height: embed.height,
                                                    border: 'none',
                                                    display: 'block',
                                                }}
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                            />
                                        )
                                    })()}
                                </div>
                                {/* Theme toggle */}
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        position: 'absolute',
                                        top: '0.375rem',
                                        right: '4rem',
                                        color: t.text,
                                        cursor: 'pointer',
                                        opacity: 0.6,
                                        zIndex: 1,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        padding: '0.25rem',
                                        lineHeight: 0,
                                    }}
                                    title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                                >
                                    {theme === 'dark' ? (
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                                        </svg>
                                    ) : (
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z" />
                                        </svg>
                                    )}
                                </button>
                                {/* Hide */}
                                <button
                                    onClick={hide}
                                    style={{
                                        position: 'absolute',
                                        top: '0.375rem',
                                        right: '2.25rem',
                                        color: t.text,
                                        cursor: 'pointer',
                                        opacity: 0.6,
                                        zIndex: 1,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        padding: '0.25rem',
                                        lineHeight: 0,
                                    }}
                                    title="Hide player (music continues)"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                                    </svg>
                                </button>
                                {/* Close */}
                                <button
                                    onClick={close}
                                    style={{
                                        position: 'absolute',
                                        top: '0.375rem',
                                        right: '0.75rem',
                                        color: t.text,
                                        cursor: 'pointer',
                                        opacity: 0.6,
                                        zIndex: 1,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        padding: '0.25rem',
                                        lineHeight: 0,
                                    }}
                                    title="Close player (stop music)"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
