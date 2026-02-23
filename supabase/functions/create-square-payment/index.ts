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

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders })
    }

    try {
        const { source_id, items, amount, shipping_address, email, user_id } = await req.json()

        if (!source_id || !amount || !items?.length) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Create payment with Square
        const paymentResponse = await fetch(`${SQUARE_API_URL}/v2/payments`, {
            method: "POST",
            headers: {
                "Square-Version": "2024-12-18",
                "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source_id,
                idempotency_key: crypto.randomUUID(),
                amount_money: {
                    amount,
                    currency: "USD",
                },
                buyer_email_address: email,
                shipping_address: {
                    address_line_1: shipping_address.line1,
                    address_line_2: shipping_address.line2 || undefined,
                    locality: shipping_address.city,
                    administrative_district_level_1: shipping_address.state,
                    postal_code: shipping_address.postal_code,
                    country: shipping_address.country,
                    first_name: shipping_address.full_name?.split(" ")[0],
                    last_name: shipping_address.full_name?.split(" ").slice(1).join(" "),
                },
            }),
        })

        const paymentData = await paymentResponse.json()

        if (!paymentResponse.ok || paymentData.errors) {
            const errorMsg = paymentData.errors?.[0]?.detail || "Payment failed"
            return new Response(
                JSON.stringify({ error: errorMsg }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        const payment = paymentData.payment
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Create order record
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: user_id || null,
                square_payment_id: payment.id,
                status: "paid",
                total: amount,
                shipping_address,
            })
            .select("id")
            .single()

        if (orderError) {
            console.error("Order insert error:", orderError)
            return new Response(
                JSON.stringify({ error: "Payment succeeded but order creation failed" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        // Create order items
        const orderItems = items.map((item: {
            product_id: string
            product_name: string
            variant_id: string
            size: string
            color: string
            unit_price: number
            quantity: number
        }) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            variant_id: item.variant_id,
            size: item.size,
            color: item.color,
            unit_price: item.unit_price,
            quantity: item.quantity,
        }))

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems)

        if (itemsError) {
            console.error("Order items insert error:", itemsError)
        }

        return new Response(
            JSON.stringify({ payment_id: payment.id, order_id: order.id }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    } catch (err) {
        console.error("Edge function error:", err)
        return new Response(
            JSON.stringify({ error: err.message || "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    }
})
