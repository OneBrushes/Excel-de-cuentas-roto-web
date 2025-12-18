import { createClient } from "@/lib/supabase/server"

export async function getDashboardMetrics(dateFilter?: { start?: string; end?: string }) {
  const supabase = await createClient()

  // Get all products for the user
  const { data: products } = await supabase.from("products").select("id").eq("is_visible", true)

  if (!products || products.length === 0) {
    return {
      totalProfit: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      monthlyProfit: 0,
      dailyProfit: 0,
      profitMargin: 0,
      orderCount: 0,
      productCount: 0,
    }
  }

  const productIds = products.map((p) => p.id)

  // Build query with date filters
  let ordersQuery = supabase.from("orders").select("*").in("product_id", productIds)

  if (dateFilter?.start) {
    ordersQuery = ordersQuery.gte("order_date", dateFilter.start)
  }
  if (dateFilter?.end) {
    ordersQuery = ordersQuery.lte("order_date", dateFilter.end)
  }

  const { data: orders } = await ordersQuery

  // Get expenses
  let expensesQuery = supabase.from("expenses").select("*").in("product_id", productIds)

  if (dateFilter?.start) {
    expensesQuery = expensesQuery.gte("expense_date", dateFilter.start)
  }
  if (dateFilter?.end) {
    expensesQuery = expensesQuery.lte("expense_date", dateFilter.end)
  }

  const { data: expenses } = await expensesQuery

  // Calculate metrics
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.revenue), 0) || 0
  const totalOrderCosts = orders?.reduce((sum, order) => sum + Number(order.cost), 0) || 0
  const totalExpenses = (expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0) + totalOrderCosts
  const totalProfit = totalRevenue - totalExpenses

  // Monthly profit (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const monthlyOrders = orders?.filter((o) => new Date(o.order_date) >= thirtyDaysAgo) || []
  const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + Number(order.revenue), 0)
  const monthlyCosts = monthlyOrders.reduce((sum, order) => sum + Number(order.cost), 0)
  const monthlyExpenses =
    expenses
      ?.filter((e) => new Date(e.expense_date) >= thirtyDaysAgo)
      .reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const monthlyProfit = monthlyRevenue - monthlyCosts - monthlyExpenses

  // Daily profit (today)
  const today = new Date().toISOString().split("T")[0]
  const dailyOrders = orders?.filter((o) => o.order_date.startsWith(today)) || []
  const dailyRevenue = dailyOrders.reduce((sum, order) => sum + Number(order.revenue), 0)
  const dailyCosts = dailyOrders.reduce((sum, order) => sum + Number(order.cost), 0)
  const dailyExpenses =
    expenses?.filter((e) => e.expense_date.startsWith(today)).reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const dailyProfit = dailyRevenue - dailyCosts - dailyExpenses

  return {
    totalProfit,
    totalRevenue,
    totalExpenses,
    monthlyProfit,
    dailyProfit,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    orderCount: orders?.length || 0,
    productCount: products.length,
  }
}

export async function getProductsWithMetrics() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })

  if (!products) return []

  const productsWithMetrics = await Promise.all(
    products.map(async (product) => {
      const { data: orders } = await supabase.from("orders").select("*").eq("product_id", product.id)

      const { data: expenses } = await supabase.from("expenses").select("*").eq("product_id", product.id)

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.revenue), 0) || 0
      const totalOrderCosts = orders?.reduce((sum, order) => sum + Number(order.cost), 0) || 0
      const totalExpenses = (expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0) + totalOrderCosts
      const totalProfit = totalRevenue - totalExpenses

      return {
        ...product,
        totalRevenue,
        totalProfit,
        totalExpenses,
        orderCount: orders?.length || 0,
      }
    }),
  )

  return productsWithMetrics
}
