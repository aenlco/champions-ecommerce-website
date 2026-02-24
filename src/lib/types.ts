export interface Product {
    id: string
    name: string
    slug: string
    description: string
    price: number
    images: string[]
    category: string
    is_active: boolean
    pay_what_you_want: boolean
    created_at: string
    square_catalog_id?: string
    last_synced_at?: string
}

export interface ProductVariant {
    id: string
    product_id: string
    size: string
    color: string
    stock_quantity: number
    sku: string
    square_variation_id?: string
}

export interface CartItem {
    product: Product
    variant: ProductVariant
    quantity: number
    customPrice?: number
}

export interface Order {
    id: string
    user_id: string | null
    square_payment_id: string
    status: string
    total: number
    shipping_address: ShippingAddress
    created_at: string
}

export interface ShippingAddress {
    full_name: string
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
}

export interface UserProfile {
    id: string
    email: string | null
    phone: string | null
    full_name: string | null
    is_admin: boolean
    created_at: string
}

export interface HomepageEntry {
    id: string
    date: string
    title: string
    type: 'video' | 'image' | 'article' | 'link' | 'music'
    media_url?: string
    description?: string
    external_url?: string
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}
