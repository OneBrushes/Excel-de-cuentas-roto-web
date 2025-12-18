import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Shopify envía el pedido en este formato
    const { id, created_at, total_price, line_items, email, name } = body

    // Buscar el producto por la tienda de Shopify usando el header o URL
    const shopifyStore = request.headers.get("x-shopify-shop-domain")

    if (!shopifyStore) {
      return NextResponse.json({ error: "Missing shop domain" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar el producto asociado a esta tienda
    const { data: product } = await supabase
      .from("products")
      .select("id, product_cost")
      .eq("shopify_store_url", `https://${shopifyStore}`)
      .single()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Calcular el costo total (costo del producto * cantidad)
    const totalQuantity = line_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 1
    const totalCost = product.product_cost * totalQuantity

    // Insertar el pedido
    const { error: insertError } = await supabase.from("orders").insert({
      product_id: product.id,
      shopify_order_id: id.toString(),
      order_date: new Date(created_at),
      revenue: Number.parseFloat(total_price),
      cost: totalCost,
      customer_email: email,
      order_number: name,
    })

    if (insertError) {
      console.error("Error inserting order:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
