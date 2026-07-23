import { useEffect, useRef, useState } from 'react'

export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

interface SelectMenuProps {
    value: string
    options: SelectOption[]
    onChange: (value: string) => void
    placeholder?: string
    ariaLabel?: string
}

/**
 * Branded dropdown that replaces the native <select>. The native option list on
 * mobile is OS-rendered and takes over the screen; this anchors a compact,
 * scrollable popover to the trigger so it never dominates the viewport.
 */
export default function SelectMenu({ value, options, onChange, placeholder = 'Select', ariaLabel }: SelectMenuProps) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)

    const selected = options.find(o => o.value === value)
    const label = selected ? selected.label : placeholder

    // Close on outside click / Escape
    useEffect(() => {
        if (!open) return
        const onPointer = (e: MouseEvent | TouchEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', onPointer)
        document.addEventListener('touchstart', onPointer)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onPointer)
            document.removeEventListener('touchstart', onPointer)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    return (
        <div ref={rootRef} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    minWidth: '10rem',
                    maxWidth: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '3px',
                    backgroundColor: 'transparent',
                    fontSize: '0.625rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: selected ? 'var(--color-black)' : 'var(--color-gray-500)',
                    cursor: 'pointer',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                <span style={{
                    display: 'inline-block',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    fontSize: '0.5rem',
                    color: 'var(--color-gray-500)',
                }}>
                    ▾
                </span>
            </button>

            {open && (
                <ul
                    role="listbox"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        zIndex: 50,
                        margin: 0,
                        padding: '0.25rem 0',
                        listStyle: 'none',
                        minWidth: '100%',
                        width: 'max-content',
                        maxWidth: 'min(80vw, 22rem)',
                        maxHeight: 'min(45vh, 300px)',
                        overflowY: 'auto',
                        backgroundColor: 'var(--color-white)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                >
                    {options.map(opt => {
                        const isSelected = opt.value === value
                        return (
                            <li
                                key={opt.value || 'placeholder'}
                                role="option"
                                aria-selected={isSelected}
                                aria-disabled={opt.disabled}
                                onClick={() => {
                                    if (opt.disabled) return
                                    onChange(opt.value)
                                    setOpen(false)
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem',
                                    padding: '0.55rem 0.75rem',
                                    fontSize: '0.625rem',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                    cursor: opt.disabled ? 'not-allowed' : 'pointer',
                                    color: opt.disabled ? 'var(--color-gray-300)' : 'var(--color-black)',
                                    fontWeight: isSelected ? 600 : 400,
                                    backgroundColor: isSelected ? 'var(--color-gray-100)' : 'transparent',
                                }}
                                onMouseEnter={e => { if (!opt.disabled) e.currentTarget.style.backgroundColor = 'var(--color-gray-100)' }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = isSelected ? 'var(--color-gray-100)' : 'transparent' }}
                            >
                                <span>{opt.label}</span>
                                {isSelected && <span style={{ fontSize: '0.6rem' }}>✓</span>}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
