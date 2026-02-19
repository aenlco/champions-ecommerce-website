import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

const TIMELINE = [
    {
        year: '2024',
        title: 'The Beginning',
        text: 'Born from a simple conviction: athletic wear should embody the discipline it serves. No excess, no distraction — raw materials, honest construction.',
    },
    {
        year: '2024',
        title: 'First Collection',
        text: 'Essentials. Six pieces built from heavyweight cotton and technical fabrics. Each item tested through hundreds of training sessions before release.',
    },
    {
        year: '2025',
        title: 'The Standard',
        text: 'Champions establishes its design language — stark minimalism, zero ornamentation, obsessive material quality. Every stitch intentional.',
    },
    {
        year: '2025',
        title: 'Community',
        text: 'A growing movement of athletes who measure progress against their own potential. Not louder — quieter, more focused, more deliberate.',
    },
]

export default function About() {
    return (
        <PageTransition>
            <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
                {/* Hero Text */}
                <section
                    style={{
                        padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)',
                        maxWidth: '800px',
                        margin: '0 auto',
                    }}
                >
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            lineHeight: 1.1,
                            textTransform: 'uppercase',
                            marginBottom: '2rem',
                        }}
                    >
                        Built for those<br />who compete<br />with themselves.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        style={{
                            fontSize: '0.875rem',
                            lineHeight: 2,
                            maxWidth: '540px',
                        }}
                    >
                        Champions isn't about being better than anyone else. It's about the relentless pursuit of your own standard — the quiet discipline of showing up, the raw honesty of measuring yourself against yesterday.
                    </motion.p>
                </section>

                {/* Timeline */}
                <section
                    style={{
                        padding: '0 clamp(1.5rem, 4vw, 3rem)',
                        maxWidth: '800px',
                        margin: '0 auto',
                        paddingBottom: 'clamp(4rem, 8vw, 8rem)',
                    }}
                >
                    {TIMELINE.map((entry, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 1fr',
                                gap: '2rem',
                                padding: '2.5rem 0',
                                borderTop: '1px solid rgba(0,0,0,0.06)',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.625rem',
                                    letterSpacing: '0.15em',
                                    color: 'var(--color-gray-400)',
                                    paddingTop: '0.125rem',
                                }}
                            >
                                {entry.year}
                            </span>
                            <div>
                                <h3
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        marginBottom: '0.75rem',
                                    }}
                                >
                                    {entry.title}
                                </h3>
                                <p
                                    style={{
                                        fontSize: '0.8125rem',
                                        lineHeight: 1.9,
                                        color: 'var(--color-gray-600)',
                                    }}
                                >
                                    {entry.text}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Values */}
                <section
                    style={{
                        padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        backgroundColor: 'var(--color-gray-50)',
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '3rem',
                            maxWidth: '1000px',
                            margin: '0 auto',
                        }}
                    >
                        {[
                            { label: 'Material First', desc: 'Heavyweight cotton. Technical fabrics. Nothing synthetic where it doesn\'t belong.' },
                            { label: 'Zero Noise', desc: 'No logos, no excess branding. The product speaks through quality, not decals.' },
                            { label: 'Test Everything', desc: 'Every piece endures months of training before it earns the right to be sold.' },
                        ].map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                            >
                                <h4
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.6875rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        marginBottom: '0.75rem',
                                    }}
                                >
                                    {v.label}
                                </h4>
                                <p style={{ fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--color-gray-500)' }}>
                                    {v.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </PageTransition>
    )
}
