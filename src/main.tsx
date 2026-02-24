import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { MusicPlayerProvider } from '@/context/MusicPlayerContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <MusicPlayerProvider>
                        <App />
                    </MusicPlayerProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
