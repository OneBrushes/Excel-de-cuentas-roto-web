import { createClient } from "@/lib/supabase/server"

export interface ChartDataPoint {
  date: string
  revenue: number
  profit: number
  expenses: number
  orders: number
}

export interface ProductChartData {
  productName: string
  revenue: number
  profit: number
  expenses: number
  orders: number
}

export async function getTimeSeriesData(days = 30) {
  const supabase = await createClient()

  // Get all visible products
  const { data: products } = await supabase.from("products").select("id").eq("is_visible", true)

  if (!products || products.length === 0) {
    return []
  }

  const productIds = products.map((p) => p.id)

  // Calculate start date
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Fetch orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .in("product_id", productIds)
    .gte("order_date", startDate.toISOString())
    .lte("order_date", endDate.toISOString())

  // Fetch expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .in("product_id", productIds)
    .gte("expense_date", startDate.toISOString())
    .lte("expense_date", endDate.toISOString())

  // Group by date
  const dataByDate = new Map<string, ChartDataPoint>()

  // Initialize all dates
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split("T")[0]
    dataByDate.set(dateKey, {
      date: dateKey,
      revenue: 0,
      profit: 0,
      expenses: 0,
      orders: 0,
    })
  }

  // Add orders
  orders?.forEach((order) => {
    const dateKey = order.order_date.split("T")[0]
    const data = dataByDate.get(dateKey)
    if (data) {
      data.revenue += Number(order.revenue)
      data.expenses += Number(order.cost)
      data.orders += 1
    }
  })

  // Add expenses
  expenses?.forEach((expense) => {
    const dateKey = expense.expense_date.split("T")[0]
    const data = dataByDate.get(dateKey)
    if (data) {
      data.expenses += Number(expense.amount)
    }
  })

  // Calculate profit
  dataByDate.forEach((data) => {
    data.profit = data.revenue - data.expenses
  })

  return Array.from(dataByDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export async function getProductComparisonData() {
  const supabase = await createClient()

  const { data: products } = await supabase.from("products").select("*").eq("is_visible", true)

  if (!products || products.length === 0) {
    return []
  }

  const productData: ProductChartData[] = await Promise.all(
    products.map(async (product) => {
      const { data: orders } = await supabase.from("orders").select("*").eq("product_id", product.id)

      const { data: expenses } = await supabase.from("expenses").select("*").eq("product_id", product.id)

      const revenue = orders?.reduce((sum, order) => sum + Number(order.revenue), 0) || 0
      const orderCosts = orders?.reduce((sum, order) => sum + Number(order.cost), 0) || 0
      const additionalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
      const totalExpenses = orderCosts + additionalExpenses
      const profit = revenue - totalExpenses

      return {
        productName: product.name,
        revenue,
        profit,
        expenses: totalExpenses,
        orders: orders?.length || 0,
      }
    }),
  )

  return productData.sort((a, b) => b.revenue - a.revenue)
}

export async function getMonthlyData() {
  const supabase = await createClient()

  const { data: products } = await supabase.from("products").select("id").eq("is_visible", true)

  if (!products || products.length === 0) {
    return []
  }

  const productIds = products.map((p) => p.id)

  // Get data for last 12 months
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12)

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .in("product_id", productIds)
    .gte("order_date", startDate.toISOString())

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .in("product_id", productIds)
    .gte("expense_date", startDate.toISOString())

  // Group by month
  const dataByMonth = new Map<string, ChartDataPoint>()

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    dataByMonth.set(monthKey, {
      date: monthKey,
      revenue: 0,
      profit: 0,
      expenses: 0,
      orders: 0,
    })
  }

  // Add orders
  orders?.forEach((order) => {
    const date = new Date(order.order_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const data = dataByMonth.get(monthKey)
    if (data) {
      data.revenue += Number(order.revenue)
      data.expenses += Number(order.cost)
      data.orders += 1
    }
  })

  // Add expenses
  expenses?.forEach((expense) => {
    const date = new Date(expense.expense_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const data = dataByMonth.get(monthKey)
    if (data) {
      data.expenses += Number(expense.amount)
    }
  })

  // Calculate profit
  dataByMonth.forEach((data) => {
    data.profit = data.revenue - data.expenses
  })

  return Array.from(dataByMonth.values()).sort((a, b) => a.date.localeCompare(b.date))
}
