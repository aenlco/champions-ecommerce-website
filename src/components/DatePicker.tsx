import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
    value: string // YY-MM-DD
    onChange: (value: string) => void
    style?: React.CSSProperties
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
}

export default function DatePicker({ value, onChange, style }: DatePickerProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Parse value (YY-MM-DD) into full year/month/day
    const parsed = value ? {
        year: 2000 + parseInt(value.slice(0, 2)),
        month: parseInt(value.slice(3, 5)) - 1,
        day: parseInt(value.slice(6, 8)),
    } : null

    const today = new Date()
    const [viewYear, setViewYear] = useState(parsed?.year || today.getFullYear())
    const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth())

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const selectDay = (day: number) => {
        const yy = String(viewYear).slice(2)
        const mm = String(viewMonth + 1).padStart(2, '0')
        const dd = String(day).padStart(2, '0')
        onChange(`${yy}-${mm}-${dd}`)
        setOpen(false)
    }

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    const goToday = () => {
        const t = new Date()
        setViewYear(t.getFullYear())
        setViewMonth(t.getMonth())
        selectDay(t.getDate())
    }

    const clear = () => {
        onChange('')
        setOpen(false)
    }

    const daysInMonth = getDaysInMonth(viewYear, viewMonth)
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

    const displayValue = value || ''

    const cellSize = '28px'

    return (
        <div ref={ref} style={{ position: 'relative', ...style }}>
            {/* Input */}
            <div
                onClick={() => {
                    if (!open && parsed) {
                        setViewYear(parsed.year)
                        setViewMonth(parsed.month)
                    }
                    setOpen(!open)
                }}
                style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.03em',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '38px',
                }}
            >
                <span style={{ color: displayValue ? 'inherit' : 'var(--color-gray-400)' }}>
                    {displayValue || 'Select date'}
                </span>
                {/* Calendar icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="0" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            </div>

            {/* Calendar Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid rgba(0,0,0,0.12)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    zIndex: 50,
                    padding: '0.75rem',
                    width: '260px',
                }}>
                    {/* Header: month/year + arrows */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.625rem',
                    }}>
                        <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                        }}>
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                                onClick={prevMonth}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-gray-100)')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                onClick={nextMonth}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-gray-100)')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Day labels */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '2px',
                        marginBottom: '4px',
                    }}>
                        {DAYS.map((d, i) => (
                            <div key={i} style={{
                                textAlign: 'center',
                                fontSize: '0.5625rem',
                                fontWeight: 500,
                                color: 'var(--color-gray-400)',
                                letterSpacing: '0.05em',
                                height: cellSize,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '2px',
                    }}>
                        {/* Empty cells before first day */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} style={{ height: cellSize }} />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const isSelected = parsed && parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day
                            const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day

                            return (
                                <button
                                    key={day}
                                    onClick={() => selectDay(day)}
                                    style={{
                                        height: cellSize,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.625rem',
                                        fontWeight: isSelected ? 600 : 400,
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? 'var(--color-gray-800)' : 'transparent',
                                        color: isSelected ? 'var(--color-white)' : isToday ? 'var(--color-black)' : 'var(--color-gray-600)',
                                        border: isToday && !isSelected ? '1px solid var(--color-gray-300)' : 'none',
                                        transition: 'background-color 0.1s',
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    {/* Footer: Clear + Today */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '0.625rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                    }}>
                        <button
                            onClick={clear}
                            style={{
                                fontSize: '0.5625rem',
                                fontWeight: 500,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--color-gray-400)',
                                cursor: 'pointer',
                                transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-black)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-gray-400)')}
                        >
                            Clear
                        </button>
                        <button
                            onClick={goToday}
                            style={{
                                fontSize: '0.5625rem',
                                fontWeight: 500,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--color-gray-400)',
                                cursor: 'pointer',
                                transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-black)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-gray-400)')}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
