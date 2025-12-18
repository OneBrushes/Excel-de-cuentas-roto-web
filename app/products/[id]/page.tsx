import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, DollarSign, TrendingUp, ShoppingCart, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { ProductActions } from "@/components/product-actions"
import { AddOrderForm } from "@/components/add-order-form"
import { AddExpenseForm } from "@/components/add-expense-form"
import { EditProductForm } from "@/components/edit-product-form"
import { SyncShopifyButton } from "@/components/sync-shopify-button"
import { EditOrderForm } from "@/components/edit-order-form"
import { EditExpenseForm } from "@/components/edit-expense-form"

export const revalidate = 30 // Added cache revalidation for better performance

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  if (params.id === "new") {
    redirect("/products/new")
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: product } = await supabase.from("products").select("*").eq("id", params.id).single()

  if (!product || product.user_id !== user.id) {
    redirect("/")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("product_id", params.id)
    .order("order_date", { ascending: false })

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("product_id", params.id)
    .order("expense_date", { ascending: false })

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.revenue), 0) || 0
  const totalOrderCosts = orders?.reduce((sum, order) => sum + Number(order.cost), 0) || 0
  const totalExpenses = (expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0) + totalOrderCosts
  const totalProfit = totalRevenue - totalExpenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const hasShopifyConnection = !!(product.shopify_store_url && product.shopify_access_token)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                <Badge variant={product.shopify_store_url ? "default" : "secondary"}>
                  {product.shopify_store_url ? "Conectado a Shopify" : "Sin conectar"}
                </Badge>
                <Badge variant={product.is_visible ? "default" : "secondary"}>
                  {product.is_visible ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Oculto
                    </>
                  )}
                </Badge>
              </div>
            </div>
            <ProductActions product={product} />
          </div>

          {/* Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Facturación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Beneficio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(totalProfit)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!orders || orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay pedidos todavía</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {order.order_number || "Pedido sin número"}
                            {order.shopify_order_id && (
                              <Badge variant="outline" className="text-xs">
                                Shopify
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{formatDate(order.order_date)}</div>
                          {order.customer_email && (
                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(Number(order.revenue))}</div>
                            <div className="text-sm text-muted-foreground">
                              Costo: {formatCurrency(Number(order.cost))}
                            </div>
                            <div
                              className={`text-sm font-medium ${Number(order.profit) >= 0 ? "text-success" : "text-destructive"}`}
                            >
                              Beneficio: {formatCurrency(Number(order.profit))}
                            </div>
                          </div>
                          <EditOrderForm order={order} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gastos Adicionales</CardTitle>
                  <CardDescription>Otros gastos relacionados con este producto</CardDescription>
                </div>
                <AddExpenseForm productId={params.id} />
              </CardHeader>
              <CardContent>
                {!expenses || expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay gastos adicionales</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(expense.expense_date)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-destructive">{formatCurrency(Number(expense.amount))}</div>
                          <EditExpenseForm expense={expense} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Costo del Producto:</span>
                <span className="font-semibold">{formatCurrency(Number(product.product_cost))}</span>
              </div>
              {product.shopify_store_url && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tienda Shopify:</span>
                  <a
                    href={product.shopify_store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {product.shopify_store_url}
                  </a>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Creado:</span>
                <span>{formatDate(product.created_at)}</span>
              </div>
              {hasShopifyConnection && (
                <div className="pt-4 border-t">
                  <SyncShopifyButton productId={params.id} />
                </div>
              )}
              {/* </CHANGE> */}
              <div className="pt-4">
                <EditProductForm product={product} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pedidos</CardTitle>
                  <CardDescription>Historial de pedidos de este producto</CardDescription>
                </div>
                <AddOrderForm productId={params.id} productCost={Number(product.product_cost)} />
              </CardHeader>
              <CardContent>
                {!orders || orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay pedidos todavía</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {order.order_number || "Pedido sin número"}
                            {order.shopify_order_id && (
                              <Badge variant="outline" className="text-xs">
                                Shopify
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{formatDate(order.order_date)}</div>
                          {order.customer_email && (
                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(Number(order.revenue))}</div>
                            <div className="text-sm text-muted-foreground">
                              Costo: {formatCurrency(Number(order.cost))}
                            </div>
                            <div
                              className={`text-sm font-medium ${Number(order.profit) >= 0 ? "text-success" : "text-destructive"}`}
                            >
                              Beneficio: {formatCurrency(Number(order.profit))}
                            </div>
                          </div>
                          <EditOrderForm order={order} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gastos Adicionales</CardTitle>
                  <CardDescription>Otros gastos relacionados con este producto</CardDescription>
                </div>
                <AddExpenseForm productId={params.id} />
              </CardHeader>
              <CardContent>
                {!expenses || expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay gastos adicionales</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(expense.expense_date)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-destructive">{formatCurrency(Number(expense.amount))}</div>
                          <EditExpenseForm expense={expense} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
