import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import Home from '@/pages/Home'
import Collections from '@/pages/Collections'
import ProductDetail from '@/pages/ProductDetail'
import About from '@/pages/About'
import Checkout from '@/pages/Checkout'
import OrderSuccess from '@/pages/OrderSuccess'

export default function App() {
    const location = useLocation()

    return (
        <>
            <Header />
            <CartDrawer />
            <main>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Home />} />
                        <Route path="/collections" element={<Collections />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                    </Routes>
                </AnimatePresence>
            </main>
            <Footer />
        </>
    )
}
