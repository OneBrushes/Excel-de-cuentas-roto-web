export interface ShopifyOrder {
  id: number
  order_number: number
  email: string
  created_at: string
  total_price: string
  line_items: Array<{
    price: string
    quantity: number
  }>
}

export async function fetchShopifyOrders(storeUrl: string, accessToken: string, since?: string) {
  try {
    // Remove protocol and trailing slash from store URL
    const cleanUrl = storeUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")

    // Build URL with optional since parameter
    let url = `https://${cleanUrl}/admin/api/2024-01/orders.json?status=any`
    if (since) {
      url += `&created_at_min=${since}`
    }

    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.orders as ShopifyOrder[]
  } catch (error) {
    console.error("[v0] Error fetching Shopify orders:", error)
    throw error
  }
}

export async function syncShopifyOrders(productId: string, storeUrl: string, accessToken: string, productCost: number) {
  const supabase = await import("@/lib/supabase/server").then((mod) => mod.createClient())
  const client = await supabase

  try {
    // Get last sync date from most recent order
    const { data: lastOrder } = await client
      .from("orders")
      .select("order_date")
      .eq("product_id", productId)
      .not("shopify_order_id", "is", null)
      .order("order_date", { ascending: false })
      .limit(1)
      .single()

    const since = lastOrder?.order_date || undefined

    // Fetch orders from Shopify
    const shopifyOrders = await fetchShopifyOrders(storeUrl, accessToken, since)

    if (!shopifyOrders || shopifyOrders.length === 0) {
      return { success: true, count: 0 }
    }

    // Get existing Shopify order IDs to avoid duplicates
    const { data: existingOrders } = await client
      .from("orders")
      .select("shopify_order_id")
      .eq("product_id", productId)
      .not("shopify_order_id", "is", null)

    const existingIds = new Set(existingOrders?.map((o) => o.shopify_order_id) || [])

    // Prepare orders for insertion
    const ordersToInsert = shopifyOrders
      .filter((order) => !existingIds.has(order.id.toString()))
      .map((order) => ({
        product_id: productId,
        shopify_order_id: order.id.toString(),
        order_date: order.created_at,
        revenue: Number.parseFloat(order.total_price),
        cost: productCost,
        customer_email: order.email,
        order_number: `#${order.order_number}`,
      }))

    if (ordersToInsert.length === 0) {
      return { success: true, count: 0 }
    }

    // Insert orders
    const { error } = await client.from("orders").insert(ordersToInsert)

    if (error) throw error

    return { success: true, count: ordersToInsert.length }
  } catch (error) {
    console.error("[v0] Error syncing Shopify orders:", error)
    throw error
  }
}
