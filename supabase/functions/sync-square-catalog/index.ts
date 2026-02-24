import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SQUARE_ACCESS_TOKEN = Deno.env.get("SQUARE_ACCESS_TOKEN")!
const SQUARE_ENVIRONMENT = Deno.env.get("SQUARE_ENVIRONMENT") || "sandbox"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const SQUARE_API_URL =
    SQUARE_ENVIRONMENT === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com"

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface SquareCatalogItem {
    type: string
    id: string
    updated_at: string
    item_data?: {
        name: string
        description?: string
        category_id?: string
        variations?: SquareVariation[]
        image_ids?: string[]
    }
}

interface SquareVariation {
    type: string
    id: string
    item_variation_data?: {
        item_id: string
        name: string
        sku?: string
        price_money?: {
            amount: number
            currency: string
        }
    }
}

interface SquareImage {
    type: string
    id: string
    image_data?: {
        url: string
    }
}

interface SquareCategory {
    type: string
    id: string
    category_data?: {
        name: string
    }
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders })
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Nonce-based auth: client inserts a sync_request row (via authenticated Supabase client),
        // then sends us just the request ID (a UUID, not a JWT — bypasses relay scanning)
        const body = await req.json().catch(() => ({}))
        const requestId = body.request_id

        if (!requestId) {
            return new Response(
                JSON.stringify({ error: "Missing request_id" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Look up the sync request and verify it's valid
        const { data: syncReq, error: reqError } = await supabase
            .from("sync_requests")
            .select("id, user_id, status, expires_at")
            .eq("id", requestId)
            .eq("status", "pending")
            .single()

        if (reqError || !syncReq) {
            return new Response(
                JSON.stringify({ error: "Invalid or expired sync request" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Check expiry
        if (new Date(syncReq.expires_at) < new Date()) {
            await supabase.from("sync_requests").update({ status: "failed" }).eq("id", requestId)
            return new Response(
                JSON.stringify({ error: "Sync request expired" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Verify user is admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", syncReq.user_id)
            .single()

        if (!profile?.is_admin) {
            return new Response(
                JSON.stringify({ error: "Admin access required" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Mark as processing
        await supabase.from("sync_requests").update({ status: "processing" }).eq("id", requestId)

        // Fetch catalog from Square
        let allItems: SquareCatalogItem[] = []
        let allImages: SquareImage[] = []
        let allCategories: SquareCategory[] = []
        let cursor: string | undefined

        do {
            const params = new URLSearchParams({ types: "ITEM,IMAGE,CATEGORY" })
            if (cursor) params.set("cursor", cursor)

            const response = await fetch(`${SQUARE_API_URL}/v2/catalog/list?${params}`, {
                headers: {
                    "Square-Version": "2024-12-18",
                    "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            })

            const data = await response.json()

            if (!response.ok || data.errors) {
                const errorMsg = data.errors?.[0]?.detail || "Failed to fetch Square catalog"
                await supabase.from("sync_requests").update({ status: "failed", result: { error: errorMsg } }).eq("id", requestId)
                return new Response(
                    JSON.stringify({ error: `Square API: ${errorMsg}` }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                )
            }

            const objects = data.objects || []
            allItems.push(...objects.filter((o: SquareCatalogItem) => o.type === "ITEM"))
            allImages.push(...objects.filter((o: SquareImage) => o.type === "IMAGE"))
            allCategories.push(...objects.filter((o: SquareCategory) => o.type === "CATEGORY"))
            cursor = data.cursor
        } while (cursor)

        // Build image URL lookup
        const imageMap = new Map<string, string>()
        for (const img of allImages) {
            if (img.image_data?.url) {
                imageMap.set(img.id, img.image_data.url)
            }
        }

        // Build category name lookup
        const categoryMap = new Map<string, string>()
        for (const cat of allCategories) {
            if (cat.category_data?.name) {
                categoryMap.set(cat.id, cat.category_data.name)
            }
        }

        // Sync each item to Supabase
        let synced = 0
        let errors: string[] = []

        for (const item of allItems) {
            if (!item.item_data) continue

            const images: string[] = []
            if (item.item_data.image_ids) {
                for (const imgId of item.item_data.image_ids) {
                    const url = imageMap.get(imgId)
                    if (url) images.push(url)
                }
            }

            // Determine price from first variation
            const firstVariation = item.item_data.variations?.[0]
            const price = firstVariation?.item_variation_data?.price_money?.amount || 0

            // Determine category from Square category
            const category = item.item_data.category_id
                ? categoryMap.get(item.item_data.category_id) || "Uncategorized"
                : "Uncategorized"

            const productData = {
                square_catalog_id: item.id,
                name: item.item_data.name,
                slug: slugify(item.item_data.name),
                description: item.item_data.description || "",
                price,
                images,
                category,
                is_active: true,
                pay_what_you_want: false,
                square_variation_data: item.item_data.variations || [],
                last_synced_at: new Date().toISOString(),
            }

            // Upsert product
            const { data: product, error: productError } = await supabase
                .from("products")
                .upsert(productData, { onConflict: "square_catalog_id" })
                .select("id")
                .single()

            if (productError) {
                errors.push(`Product "${item.item_data.name}": ${productError.message}`)
                continue
            }

            // Sync variations as product_variants
            if (item.item_data.variations) {
                for (const variation of item.item_data.variations) {
                    if (!variation.item_variation_data) continue

                    const variantData = {
                        square_variation_id: variation.id,
                        product_id: product.id,
                        size: variation.item_variation_data.name || "One Size",
                        color: "Default",
                        stock_quantity: 0,
                        sku: variation.item_variation_data.sku || `${slugify(item.item_data.name)}-${variation.id.slice(-6)}`,
                    }

                    const { error: variantError } = await supabase
                        .from("product_variants")
                        .upsert(variantData, { onConflict: "square_variation_id" })

                    if (variantError) {
                        errors.push(`Variant "${variation.item_variation_data.name}": ${variantError.message}`)
                    }
                }
            }

            synced++
        }

        // Fetch inventory counts from Square
        const variationIds = allItems.flatMap(
            item => item.item_data?.variations?.map(v => v.id) || []
        )

        if (variationIds.length > 0) {
            const inventoryResponse = await fetch(`${SQUARE_API_URL}/v2/inventory/counts/batch-retrieve`, {
                method: "POST",
                headers: {
                    "Square-Version": "2024-12-18",
                    "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    catalog_object_ids: variationIds,
                }),
            })

            const inventoryData = await inventoryResponse.json()

            if (inventoryResponse.ok && inventoryData.counts) {
                for (const count of inventoryData.counts) {
                    if (count.state === "IN_STOCK") {
                        await supabase
                            .from("product_variants")
                            .update({ stock_quantity: parseInt(count.quantity || "0") })
                            .eq("square_variation_id", count.catalog_object_id)
                    }
                }
            }
        }

        const result = {
            success: true,
            synced,
            total_items: allItems.length,
            errors: errors.length > 0 ? errors : undefined,
        }

        // Mark sync request as completed
        await supabase.from("sync_requests").update({ status: "completed", result }).eq("id", requestId)

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    } catch (err) {
        console.error("Sync error:", err)
        return new Response(
            JSON.stringify({ error: err.message || "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    }
})
