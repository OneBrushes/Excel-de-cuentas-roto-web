export interface Product {
  id: string
  user_id: string
  name: string
  shopify_store_url: string | null
  shopify_access_token: string | null
  product_cost: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  product_id: string
  shopify_order_id: string | null
  order_date: string
  revenue: number
  cost: number
  profit: number
  customer_email: string | null
  order_number: string | null
  created_at: string
}

export interface Expense {
  id: string
  product_id: string
  description: string
  amount: number
  expense_date: string
  created_at: string
}

export interface DashboardMetrics {
  totalProfit: number
  totalRevenue: number
  totalExpenses: number
  monthlyProfit: number
  dailyProfit: number
  profitMargin: number
  orderCount: number
  productCount: number
}

export interface ProductMetrics extends Product {
  totalRevenue: number
  totalProfit: number
  totalExpenses: number
  orderCount: number
}
