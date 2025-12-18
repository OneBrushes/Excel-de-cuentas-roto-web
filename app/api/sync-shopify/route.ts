import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncShopifyOrders } from "@/lib/shopify"

export async function POST(request: Request) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Get product with Shopify credentials
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("user_id", user.id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    if (!product.shopify_store_url || !product.shopify_access_token) {
      return NextResponse.json({ error: "Credenciales de Shopify no configuradas" }, { status: 400 })
    }

    // Sync orders
    const result = await syncShopifyOrders(
      productId,
      product.shopify_store_url,
      product.shopify_access_token,
      Number(product.product_cost),
    )

    return NextResponse.json({
      success: true,
      message: `Se sincronizaron ${result.count} pedidos`,
      count: result.count,
    })
  } catch (error: any) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json({ error: error.message || "Error al sincronizar" }, { status: 500 })
  }
}
