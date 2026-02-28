import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Step = 'phone' | 'otp' | 'done'

export default function ComingSoon() {
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<Step>('phone')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const isValidPhone = (value: string) =>
        /^\+[\d]{10,15}$/.test(value.trim())

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = phone.trim()

        if (!isValidPhone(trimmed)) {
            setError('Enter a valid number with country code (e.g. +1234567890)')
            return
        }

        setLoading(true)
        setError('')

        // Save as unverified immediately
        await supabase
            .from('newsletter_subscribers')
            .upsert({ phone_number: trimmed, verified: false }, { onConflict: 'phone_number' })

        const { error: otpError } = await supabase.auth.signInWithOtp({ phone: trimmed })

        setLoading(false)

        if (otpError) {
            setError(otpError.message)
            return
        }

        setStep('otp')
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.trim().length !== 6) {
            setError('Enter the 6-digit code.')
            return
        }

        setLoading(true)
        setError('')

        const { error: verifyError } = await supabase.auth.verifyOtp({
            phone: phone.trim(),
            token: otp.trim(),
            type: 'sms',
        })

        if (verifyError) {
            setLoading(false)
            setError(verifyError.message)
            return
        }

        // Phone verified — mark as verified
        const { error: dbError } = await supabase
            .from('newsletter_subscribers')
            .update({ verified: true })
            .eq('phone_number', phone.trim())

        setLoading(false)

        if (dbError) {
            setError('Something went wrong. Please try again.')
            return
        }

        setStep('done')
    }

    const inputClass =
        'w-full bg-transparent py-2 font-mono text-xs tracking-[0.1em] text-black placeholder:text-black/40 outline-none text-center transition-colors appearance-none rounded-none shadow-none hover:!border-b-black focus:!border-b-black'

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-6">
            <h1 className="font-mono text-base tracking-[0.35em] text-black">
                3 . 20 . 26
            </h1>

            <div className="mt-16">
                {step === 'done' ? (
                    <p className="font-mono text-sm tracking-[0.2em] uppercase text-black">
                        Thank you for signing up!
                    </p>
                ) : step === 'otp' ? (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-4 w-full max-w-xs">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                                setOtp(e.target.value.replace(/\D/g, ''))
                                if (error) setError('')
                            }}
                            placeholder="Enter Code"
                            required
                            autoFocus
                            style={{ border: 'none', borderBottom: '1px solid transparent' }}
                            className={inputClass}
                        />
                        {error && (
                            <p className="font-mono text-xs text-red-500 tracking-wide">
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="font-mono text-xs tracking-[0.25em] uppercase text-black hover:opacity-60 transition-opacity disabled:opacity-30 mt-2 cursor-pointer"
                        >
                            {loading ? '...' : 'Verify →'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSendOtp} className="flex flex-col items-center gap-4 w-full max-w-xs">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value)
                                if (error) setError('')
                            }}
                            placeholder="Phone Number"
                            required
                            style={{ border: 'none', borderBottom: '1px solid transparent' }}
                            className={inputClass}
                        />
                        {error && (
                            <p className="font-mono text-xs text-red-500 tracking-wide">
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="font-mono text-xs tracking-[0.25em] uppercase text-black hover:opacity-60 transition-opacity disabled:opacity-30 mt-2 cursor-pointer"
                        >
                            {loading ? '...' : 'Notify Me →'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
