import { useState, useEffect, useRef } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { useAdminMedia } from '@/hooks/useAdminMedia'

type BucketType = 'homepage-images' | 'homepage-music'

export default function AdminMedia() {
    const [activeBucket, setActiveBucket] = useState<BucketType>('homepage-images')
    const { files, loading, uploading, fetchFiles, uploadFile, deleteFile } = useAdminMedia(activeBucket)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)

        // Validate file type
        if (activeBucket === 'homepage-images') {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file (JPG, PNG, WebP, etc.)')
                return
            }
        } else {
            if (!file.type.startsWith('audio/')) {
                setError('Please select an audio file (MP3, WAV, etc.)')
                return
            }
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            setError('File size must be under 50MB.')
            return
        }

        try {
            await uploadFile(file)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Upload failed.'
            setError(message)
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleDelete = async (fileName: string) => {
        if (!confirm(`Delete "${fileName}"?`)) return
        try {
            await deleteFile(fileName)
        } catch {
            setError('Failed to delete file.')
        }
    }

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url)
        setCopied(url)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <AdminLayout>
            <div style={{ maxWidth: '1000px' }}>
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
                        Media Library
                    </h1>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={activeBucket === 'homepage-images' ? 'image/*' : 'audio/*'}
                            onChange={handleUpload}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                                padding: '0.625rem 1.25rem',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                backgroundColor: 'var(--color-black)',
                                color: 'var(--color-white)',
                                opacity: uploading ? 0.6 : 1,
                                cursor: uploading ? 'wait' : 'pointer',
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>
                </div>

                {/* Bucket Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    paddingBottom: '0.75rem',
                }}>
                    {([
                        { key: 'homepage-images' as BucketType, label: 'Images' },
                        { key: 'homepage-music' as BucketType, label: 'Music' },
                    ]).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveBucket(tab.key)}
                            style={{
                                fontSize: '0.625rem',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                fontWeight: activeBucket === tab.key ? 600 : 400,
                                opacity: activeBucket === tab.key ? 1 : 0.5,
                                borderBottom: activeBucket === tab.key ? '1px solid var(--color-black)' : '1px solid transparent',
                                paddingBottom: '0.25rem',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        border: '1px solid rgba(255,0,0,0.2)',
                        backgroundColor: 'rgba(255,0,0,0.04)',
                    }}>
                        <p style={{ fontSize: '0.6875rem', color: 'red' }}>{error}</p>
                    </div>
                )}

                {loading ? (
                    <p style={{
                        fontSize: '0.6875rem',
                        color: 'var(--color-gray-400)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Loading files...
                    </p>
                ) : files.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: 'var(--color-white)',
                    }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', marginBottom: '1rem' }}>
                            No {activeBucket === 'homepage-images' ? 'images' : 'music files'} uploaded yet.
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                padding: '0.625rem 1.25rem',
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                backgroundColor: 'var(--color-black)',
                                color: 'var(--color-white)',
                                cursor: 'pointer',
                            }}
                        >
                            Upload First File
                        </button>
                    </div>
                ) : activeBucket === 'homepage-images' ? (
                    /* Image Grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem',
                    }}>
                        {files.map(file => (
                            <div
                                key={file.id}
                                style={{
                                    backgroundColor: 'var(--color-white)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ aspectRatio: '1', overflow: 'hidden', backgroundColor: 'var(--color-gray-100)' }}>
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ padding: '0.75rem' }}>
                                    <p style={{
                                        fontSize: '0.6875rem',
                                        fontWeight: 500,
                                        marginBottom: '0.5rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {file.name}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => copyUrl(file.url)}
                                            style={{
                                                fontSize: '0.5625rem',
                                                letterSpacing: '0.1em',
                                                textTransform: 'uppercase',
                                                textDecoration: 'underline',
                                                textUnderlineOffset: '2px',
                                                color: copied === file.url ? 'green' : 'var(--color-gray-500)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {copied === file.url ? 'Copied!' : 'Copy URL'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.name)}
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
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Music List */
                    <div style={{ backgroundColor: 'var(--color-white)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        {files.map(file => (
                            <div
                                key={file.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                        {file.name}
                                    </p>
                                    <audio controls style={{ height: '28px', width: '100%', maxWidth: '300px' }}>
                                        <source src={file.url} />
                                    </audio>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, marginLeft: '1rem' }}>
                                    <button
                                        onClick={() => copyUrl(file.url)}
                                        style={{
                                            fontSize: '0.5625rem',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            textDecoration: 'underline',
                                            textUnderlineOffset: '2px',
                                            color: copied === file.url ? 'green' : 'var(--color-gray-500)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {copied === file.url ? 'Copied!' : 'Copy URL'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.name)}
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

                <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.625rem', color: 'var(--color-gray-400)', lineHeight: 1.8 }}>
                        Upload images and music for the homepage. After uploading, copy the URL and paste it
                        into a homepage entry's Media URL field. Images: JPG, PNG, WebP (max 50MB).
                        Music: MP3, WAV (max 50MB).
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}
