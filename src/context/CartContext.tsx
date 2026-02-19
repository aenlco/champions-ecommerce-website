import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { CartItem, Product, ProductVariant } from '@/lib/types'

interface CartContextType {
    items: CartItem[]
    addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
    removeItem: (variantId: string) => void
    updateQuantity: (variantId: string, quantity: number) => void
    clearCart: () => void
    itemCount: number
    subtotal: number
    isCartOpen: boolean
    openCart: () => void
    closeCart: () => void
    toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'champions-cart'

function loadCart(): CartItem[] {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveCart(items: CartItem[]) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(loadCart)
    const [isCartOpen, setIsCartOpen] = useState(false)

    useEffect(() => {
        saveCart(items)
    }, [items])

    const addItem = useCallback((product: Product, variant: ProductVariant, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.variant.id === variant.id)
            if (existing) {
                return prev.map(item =>
                    item.variant.id === variant.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }
            return [...prev, { product, variant, quantity }]
        })
        setIsCartOpen(true)
    }, [])

    const removeItem = useCallback((variantId: string) => {
        setItems(prev => prev.filter(item => item.variant.id !== variantId))
    }, [])

    const updateQuantity = useCallback((variantId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(item => item.variant.id !== variantId))
            return
        }
        setItems(prev =>
            prev.map(item =>
                item.variant.id === variantId ? { ...item, quantity } : item
            )
        )
    }, [])

    const clearCart = useCallback(() => {
        setItems([])
    }, [])

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    const openCart = useCallback(() => setIsCartOpen(true), [])
    const closeCart = useCallback(() => setIsCartOpen(false), [])
    const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), [])

    return (
        <CartContext.Provider value={{
            items, addItem, removeItem, updateQuantity, clearCart,
            itemCount, subtotal, isCartOpen, openCart, closeCart, toggleCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used within CartProvider')
    return ctx
}
