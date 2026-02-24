import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import HomeNew from '@/pages/HomeNew'
import HomeOriginal from '@/pages/HomeOriginal'
import Collections from '@/pages/Collections'
import ProductDetail from '@/pages/ProductDetail'
import About from '@/pages/About'
import Checkout from '@/pages/Checkout'
import OrderSuccess from '@/pages/OrderSuccess'
import SignIn from '@/pages/SignIn'
import SignUp from '@/pages/SignUp'
import Account from '@/pages/Account'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function App() {
    const location = useLocation()
    const isHome = location.pathname === '/'

    return (
        <>
            {!isHome && <Header />}
            <CartDrawer />
            <main>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<HomeNew />} />
                        <Route path="/home-classic" element={<HomeOriginal />} />
                        <Route path="/shop" element={<Collections />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/sign-in" element={<SignIn />} />
                        <Route path="/sign-up" element={<SignUp />} />
                        <Route path="/account" element={
                            <ProtectedRoute>
                                <Account />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </AnimatePresence>
            </main>
            <Footer />
        </>
    )
}
