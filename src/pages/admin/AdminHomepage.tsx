import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { useAdminHomepageEntries } from '@/hooks/useHomepageEntries'
import type { HomepageEntry } from '@/lib/types'

const ENTRY_TYPES = ['video', 'image', 'article', 'link', 'music'] as const

interface EntryForm {
    date: string
    title: string
    type: HomepageEntry['type']
    media_url: string
    description: string
    external_url: string
    sort_order: number
    is_active: boolean
}

const EMPTY_FORM: EntryForm = {
    date: '',
    title: '',
    type: 'link',
    media_url: '',
    description: '',
    external_url: '',
    sort_order: 0,
    is_active: true,
}

export default function AdminHomepage() {
    const { entries, loading, createEntry, updateEntry, deleteEntry } = useAdminHomepageEntries()
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<EntryForm>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const openCreate = () => {
        setEditingId(null)
        setForm({ ...EMPTY_FORM, sort_order: entries.length })
        setShowForm(true)
        setError(null)
    }

    const openEdit = (entry: HomepageEntry) => {
        setEditingId(entry.id)
        setForm({
            date: entry.date,
            title: entry.title,
            type: entry.type,
            media_url: entry.media_url || '',
            description: entry.description || '',
            external_url: entry.external_url || '',
            sort_order: entry.sort_order,
            is_active: entry.is_active,
        })
        setShowForm(true)
        setError(null)
    }

    const handleSave = async () => {
        if (!form.date || !form.title) {
            setError('Date and title are required.')
            return
        }

        setSaving(true)
        setError(null)

        try {
            const data = {
                date: form.date,
                title: form.title,
                type: form.type,
                media_url: form.media_url || undefined,
                description: form.description || undefined,
                external_url: form.external_url || undefined,
                sort_order: form.sort_order,
                is_active: form.is_active,
            }

            if (editingId) {
                await updateEntry(editingId, data)
            } else {
                await createEntry(data as Omit<HomepageEntry, 'id' | 'created_at' | 'updated_at'>)
            }

            setShowForm(false)
            setForm(EMPTY_FORM)
            setEditingId(null)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save entry.'
            setError(message)
        }

        setSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry?')) return
        try {
            await deleteEntry(id)
        } catch {
            setError('Failed to delete entry.')
        }
    }

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
                        Homepage Entries
                    </h1>
                    <button
                        onClick={openCreate}
                        style={{
                            padding: '0.625rem 1.25rem',
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            backgroundColor: 'var(--color-black)',
                            color: 'var(--color-white)',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        Add Entry
                    </button>
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <div style={{
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        backgroundColor: 'var(--color-white)',
                        border: '1px solid rgba(0,0,0,0.06)',
                    }}>
                        <p className="text-label" style={{ color: 'var(--color-gray-500)', marginBottom: '1.25rem' }}>
                            {editingId ? 'Edit Entry' : 'New Entry'}
                        </p>

                        {error && (
                            <p style={{ fontSize: '0.6875rem', color: 'red', marginBottom: '1rem' }}>{error}</p>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                    Date (YY-MM-DD)
                                </p>
                                <input
                                    value={form.date}
                                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                                    placeholder="25-07-31"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                    Type
                                </p>
                                <select
                                    value={form.type}
                                    onChange={e => setForm(prev => ({ ...prev, type: e.target.value as HomepageEntry['type'] }))}
                                    style={inputStyle}
                                >
                                    {ENTRY_TYPES.map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '0.75rem' }}>
                            <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                Title
                            </p>
                            <input
                                value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Entry title"
                                style={inputStyle}
                            />
                        </div>

                        {(form.type === 'video' || form.type === 'image' || form.type === 'music') && (
                            <div style={{ marginBottom: '0.75rem' }}>
                                <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                    Media URL
                                </p>
                                <input
                                    value={form.media_url}
                                    onChange={e => setForm(prev => ({ ...prev, media_url: e.target.value }))}
                                    placeholder={form.type === 'video' ? 'YouTube embed URL' : form.type === 'music' ? 'Audio file URL (.mp3) or Spotify/SoundCloud embed URL' : 'Image URL (or paste from Media library)'}
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        {(form.type === 'article' || form.type === 'link') && (
                            <>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                        Description (optional)
                                    </p>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description"
                                        rows={2}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <p className="text-label" style={{ color: 'var(--color-gray-400)', marginBottom: '0.375rem' }}>
                                        External URL
                                    </p>
                                    <input
                                        value={form.external_url}
                                        onChange={e => setForm(prev => ({ ...prev, external_url: e.target.value }))}
                                        placeholder="https://..."
                                        style={inputStyle}
                                    />
                                </div>
                            </>
                        )}

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

                {/* Entries List */}
                {loading ? (
                    <p style={{
                        fontSize: '0.6875rem',
                        color: 'var(--color-gray-400)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Loading entries...
                    </p>
                ) : entries.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: 'var(--color-white)',
                    }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>
                            No homepage entries yet. Add your first entry to get started.
                        </p>
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'var(--color-white)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        {entries.map(entry => (
                            <div
                                key={entry.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                                }}
                            >
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline', flex: 1 }}>
                                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-gray-400)', width: '70px', flexShrink: 0 }}>
                                        {entry.date}
                                    </span>
                                    <div>
                                        <a
                                            href={`/#entry-${entry.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                opacity: entry.is_active ? 1 : 0.4,
                                                textDecoration: 'underline',
                                                textUnderlineOffset: '3px',
                                                textDecorationColor: 'rgba(0,0,0,0.15)',
                                                color: 'inherit',
                                            }}
                                        >
                                            {entry.title}
                                        </a>
                                        <span style={{
                                            fontSize: '0.5625rem',
                                            color: 'var(--color-gray-400)',
                                            marginLeft: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                        }}>
                                            {entry.type}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                                    <button
                                        onClick={() => openEdit(entry)}
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
                                        onClick={() => handleDelete(entry.id)}
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
                        Homepage entries appear as a date/title list on the front page. Clicking an entry
                        expands it to show media content. Use the Media library to upload images, then paste
                        the URL into an entry's Media URL field.
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}
