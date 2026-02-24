import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { useAdminPlayerTracks, type PlayerTrackRow } from '@/hooks/usePlayerTracks'
import { useAdminMedia } from '@/hooks/useAdminMedia'

interface TrackForm {
    title: string
    artist: string
    audio_url: string
    sort_order: number
    is_active: boolean
}

const EMPTY_FORM: TrackForm = {
    title: '',
    artist: '',
    audio_url: '',
    sort_order: 0,
    is_active: true,
}

export default function AdminMusicPlayer() {
    const {
        tracks, config, loading,
        addTrack, updateTrack, deleteTrack, updateConfig,
    } = useAdminPlayerTracks()

    const { files: mediaFiles, loading: mediaLoading, fetchFiles } = useAdminMedia('homepage-music')

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<TrackForm>(EMPTY_FORM)
    const [embedInput, setEmbedInput] = useState(config.embed_url || '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [embedSaved, setEmbedSaved] = useState(false)

    // Sync embed input when config loads
    const [embedLoaded, setEmbedLoaded] = useState(false)
    if (!embedLoaded && config.embed_url !== null) {
        setEmbedInput(config.embed_url || '')
        setEmbedLoaded(true)
    }

    // Fetch media files when form opens
    useEffect(() => {
        if (showForm) {
            fetchFiles()
        }
    }, [showForm, fetchFiles])

    const openCreate = () => {
        setEditingId(null)
        setForm({ ...EMPTY_FORM, sort_order: tracks.length })
        setShowForm(true)
        setError(null)
    }

    const openEdit = (track: PlayerTrackRow) => {
        setEditingId(track.id)
        setForm({
            title: track.title,
            artist: track.artist,
            audio_url: track.audio_url,
            sort_order: track.sort_order,
            is_active: track.is_active,
        })
        setShowForm(true)
        setError(null)
    }

    const handleSave = async () => {
        if (!form.title || !form.audio_url) {
            setError('Title and audio URL are required.')
            return
        }

        setSaving(true)
        setError(null)

        try {
            if (editingId) {
                await updateTrack(editingId, form)
            } else {
                await addTrack(form)
            }
            setShowForm(false)
            setForm(EMPTY_FORM)
            setEditingId(null)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save track.'
            setError(message)
        }

        setSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this track?')) return
        try {
            await deleteTrack(id)
        } catch {
            setError('Failed to delete track.')
        }
    }

    const handleToggleEnabled = async () => {
        try {
            await updateConfig('player_enabled', config.is_enabled ? 'false' : 'true')
        } catch {
            setError('Failed to update setting.')
        }
    }

    const handleModeChange = async (mode: 'tracks' | 'embed') => {
        try {
            await updateConfig('player_mode', mode)
        } catch {
            setError('Failed to update mode.')
        }
    }

    const handleSaveEmbed = async () => {
        try {
            await updateConfig('player_embed_url', embedInput)
            setEmbedSaved(true)
            setTimeout(() => setEmbedSaved(false), 3000)
        } catch {
            setError('Failed to save embed URL.')
        }
    }

    const audioFiles = mediaFiles.filter(f =>
        /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(f.name)
    )

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.625rem 0.75rem',
        border: '1px solid rgba(0,0,0,0.12)',
        fontSize: '0.75rem',
        letterSpacing: '0.03em',
        backgroundColor: 'transparent',
    }

    return (
        <AdminLayout>
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                    }}>
                        Music Player
                    </h1>

                    {/* Enable/Disable toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                            fontSize: '0.5625rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: config.is_enabled ? 'green' : 'var(--color-gray-400)',
                            fontWeight: 600,
                        }}>
                            {config.is_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                            onClick={handleToggleEnabled}
                            style={{
                                position: 'relative',
                                width: '44px',
                                height: '22px',
                                border: config.is_enabled ? '2px solid var(--color-black)' : '2px solid rgba(0,0,0,0.2)',
                                backgroundColor: config.is_enabled ? 'var(--color-black)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                padding: 0,
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '2px',
                                left: config.is_enabled ? '22px' : '2px',
                                width: '14px',
                                height: '14px',
                                backgroundColor: config.is_enabled ? 'var(--color-white)' : 'rgba(0,0,0,0.25)',
                                transition: 'left 0.2s, background-color 0.2s',
                            }} />
                        </button>
                    </div>
                </div>

                {error && (
                    <p style={{ fontSize: '0.6875rem', color: 'red', marginBottom: '1rem' }}>{error}</p>
                )}

                {/* Mode Selection */}
                <div style={{
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid rgba(0,0,0,0.06)',
                }}>
                    <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.75rem' }}>
                        Player Mode
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => handleModeChange('tracks')}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                backgroundColor: config.mode === 'tracks' ? 'var(--color-black)' : 'transparent',
                                color: config.mode === 'tracks' ? 'var(--color-white)' : 'var(--color-gray-500)',
                                border: '1px solid rgba(0,0,0,0.12)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            Uploaded Tracks
                        </button>
                        <button
                            onClick={() => handleModeChange('embed')}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                backgroundColor: config.mode === 'embed' ? 'var(--color-black)' : 'transparent',
                                color: config.mode === 'embed' ? 'var(--color-white)' : 'var(--color-gray-500)',
                                border: '1px solid rgba(0,0,0,0.12)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            Playlist Embed
                        </button>
                    </div>

                    {config.mode === 'embed' && (
                        <div>
                            <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                Playlist URL (Spotify, Apple Music, SoundCloud, or Tidal)
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    value={embedInput}
                                    onChange={e => setEmbedInput(e.target.value)}
                                    placeholder="https://open.spotify.com/playlist/..."
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button
                                    onClick={handleSaveEmbed}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        fontSize: '0.625rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        backgroundColor: 'var(--color-black)',
                                        color: 'var(--color-white)',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                    }}
                                >
                                    Save
                                </button>
                            </div>
                            {embedSaved && (
                                <p style={{
                                    fontSize: '0.625rem',
                                    color: 'green',
                                    marginTop: '0.5rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.05em',
                                }}>
                                    Playlist URL saved successfully.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Tracks Section (only when mode is tracks) */}
                {config.mode === 'tracks' && (
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                        }}>
                            <p className="text-label" style={{ color: 'var(--color-gray-400)' }}>
                                Tracks
                            </p>
                            <button
                                onClick={openCreate}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.625rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    backgroundColor: 'var(--color-black)',
                                    color: 'var(--color-white)',
                                    cursor: 'pointer',
                                }}
                            >
                                Add Track
                            </button>
                        </div>

                        {/* Add/Edit Form */}
                        {showForm && (
                            <div style={{
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                backgroundColor: 'var(--color-white)',
                                border: '1px solid rgba(0,0,0,0.06)',
                            }}>
                                <p className="text-label" style={{ color: 'var(--color-gray-500)', marginBottom: '1.25rem' }}>
                                    {editingId ? 'Edit Track' : 'New Track'}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div>
                                        <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                            Title
                                        </p>
                                        <input
                                            value={form.title}
                                            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="Track title"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                            Artist
                                        </p>
                                        <input
                                            value={form.artist}
                                            onChange={e => setForm(prev => ({ ...prev, artist: e.target.value }))}
                                            placeholder="Artist name"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                        Audio File
                                    </p>
                                    {mediaLoading ? (
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--color-gray-400)' }}>
                                            Loading media files...
                                        </p>
                                    ) : audioFiles.length > 0 ? (
                                        <div>
                                            <select
                                                value={form.audio_url}
                                                onChange={e => setForm(prev => ({ ...prev, audio_url: e.target.value }))}
                                                style={{
                                                    ...inputStyle,
                                                    cursor: 'pointer',
                                                    appearance: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 0.75rem center',
                                                    paddingRight: '2rem',
                                                }}
                                            >
                                                <option value="">Select an audio file...</option>
                                                {audioFiles.map(f => (
                                                    <option key={f.id} value={f.url}>
                                                        {f.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p style={{
                                                fontSize: '0.5625rem',
                                                color: 'var(--color-gray-400)',
                                                marginTop: '0.375rem',
                                            }}>
                                                Or paste a URL directly:
                                            </p>
                                            <input
                                                value={form.audio_url}
                                                onChange={e => setForm(prev => ({ ...prev, audio_url: e.target.value }))}
                                                placeholder="https://..."
                                                style={{ ...inputStyle, marginTop: '0.25rem' }}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                value={form.audio_url}
                                                onChange={e => setForm(prev => ({ ...prev, audio_url: e.target.value }))}
                                                placeholder="Paste URL from Media library (.mp3, .wav)"
                                                style={inputStyle}
                                            />
                                            <p style={{
                                                fontSize: '0.5625rem',
                                                color: 'var(--color-gray-400)',
                                                marginTop: '0.375rem',
                                            }}>
                                                No audio files found. Upload files in the Media tab first.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                            Sort Order
                                        </p>
                                        <input
                                            type="number"
                                            value={form.sort_order}
                                            onChange={e => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.625rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={form.is_active}
                                                onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                                style={{ width: 'auto', accentColor: 'var(--color-black)' }}
                                            />
                                            <span style={{ fontSize: '0.6875rem', letterSpacing: '0.05em' }}>Active</span>
                                        </label>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{
                                            padding: '0.625rem 1.25rem',
                                            fontSize: '0.625rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                            backgroundColor: 'var(--color-black)',
                                            color: 'var(--color-white)',
                                            opacity: saving ? 0.6 : 1,
                                            cursor: saving ? 'wait' : 'pointer',
                                        }}
                                    >
                                        {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        onClick={() => { setShowForm(false); setEditingId(null); setError(null) }}
                                        style={{
                                            padding: '0.625rem 1.25rem',
                                            fontSize: '0.625rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                            border: '1px solid rgba(0,0,0,0.12)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Track List */}
                        {loading ? (
                            <p style={{
                                fontSize: '0.6875rem',
                                color: 'var(--color-gray-400)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                            }}>
                                Loading tracks...
                            </p>
                        ) : tracks.length === 0 ? (
                            <div style={{
                                padding: '3rem',
                                textAlign: 'center',
                                border: '1px solid rgba(0,0,0,0.06)',
                                backgroundColor: 'var(--color-white)',
                            }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>
                                    No tracks yet. Upload audio files in the Media library, then add them here.
                                </p>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: 'var(--color-white)', border: '1px solid rgba(0,0,0,0.06)' }}>
                                {tracks.map((track, i) => (
                                    <div
                                        key={track.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            borderBottom: i < tracks.length - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none',
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline', flex: 1 }}>
                                            <span style={{
                                                fontSize: '0.625rem',
                                                color: 'var(--color-gray-400)',
                                                width: '24px',
                                                flexShrink: 0,
                                                fontFamily: 'var(--font-mono)',
                                            }}>
                                                {i + 1}
                                            </span>
                                            <div>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    opacity: track.is_active ? 1 : 0.4,
                                                }}>
                                                    {track.title}
                                                </span>
                                                {track.artist && (
                                                    <span style={{
                                                        fontSize: '0.6875rem',
                                                        color: 'var(--color-gray-400)',
                                                        marginLeft: '0.75rem',
                                                    }}>
                                                        {track.artist}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                                            <button
                                                onClick={() => openEdit(track)}
                                                style={{
                                                    fontSize: '0.5625rem',
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    textDecoration: 'underline',
                                                    textUnderlineOffset: '2px',
                                                    color: 'var(--color-gray-500)',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(track.id)}
                                                style={{
                                                    fontSize: '0.5625rem',
                                                    letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                    textDecoration: 'underline',
                                                    textUnderlineOffset: '2px',
                                                    color: 'red',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Info */}
                <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.625rem', color: 'var(--color-gray-400)', lineHeight: 1.8 }}>
                        The music player appears as a persistent bar at the bottom of the site. Use "Uploaded Tracks"
                        mode to play audio files from your Media library, or "Playlist Embed" mode to embed a
                        Spotify, Apple Music, SoundCloud, or Tidal playlist. Visitors can minimize the player
                        (music keeps playing) or close it entirely to stop playback.
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}
