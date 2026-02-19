import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
    children: ReactNode
}

export default function PageTransition({ children }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
            {children}
        </motion.div>
    )
}
