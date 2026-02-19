import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product, ProductVariant } from '@/lib/types'

export function useProducts(category?: string) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            setLoading(true)
            let query = supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (category) {
                query = query.eq('category', category)
            }

            const { data, error: err } = await query
            if (err) {
                setError(err.message)
            } else {
                setProducts(data || [])
            }
            setLoading(false)
        }
        fetch()
    }, [category])

    return { products, loading, error }
}

export function useProduct(slug: string) {
    const [product, setProduct] = useState<Product | null>(null)
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetch() {
            setLoading(true)

            const { data: prod, error: prodErr } = await supabase
                .from('products')
                .select('*')
                .eq('slug', slug)
                .single()

            if (prodErr) {
                setError(prodErr.message)
                setLoading(false)
                return
            }

            setProduct(prod)

            const { data: vars, error: varErr } = await supabase
                .from('product_variants')
                .select('*')
                .eq('product_id', prod.id)
                .order('size')

            if (varErr) {
                setError(varErr.message)
            } else {
                setVariants(vars || [])
            }
            setLoading(false)
        }
        fetch()
    }, [slug])

    return { product, variants, loading, error }
}
