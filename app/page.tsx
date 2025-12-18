import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricCard } from "@/components/metric-card"
import { getDashboardMetrics, getProductsWithMetrics } from "@/lib/queries"
import { TrendingUp, DollarSign, TrendingDown, ShoppingCart, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const revalidate = 30 // Revalidate every 30 seconds

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const metrics = await getDashboardMetrics()
  const products = await getProductsWithMetrics()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* KPI Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Beneficio Total"
              value={formatCurrency(metrics.totalProfit)}
              icon={TrendingUp}
              className="lg:col-span-1"
            />
            <MetricCard
              title="Facturación Total"
              value={formatCurrency(metrics.totalRevenue)}
              icon={DollarSign}
              className="lg:col-span-1"
            />
            <MetricCard
              title="Gastos Totales"
              value={formatCurrency(metrics.totalExpenses)}
              icon={TrendingDown}
              className="lg:col-span-1"
            />
            <MetricCard
              title="Beneficio Mensual"
              value={formatCurrency(metrics.monthlyProfit)}
              icon={TrendingUp}
              className="lg:col-span-1"
            />
            <MetricCard
              title="Beneficio Diario"
              value={formatCurrency(metrics.dailyProfit)}
              icon={TrendingUp}
              className="lg:col-span-1"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Margen de Beneficio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metrics.profitMargin.toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  {metrics.orderCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Productos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  {metrics.productCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Productos / Tiendas</CardTitle>
              <CardDescription>Vista detallada de cada producto con sus métricas</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                  <p className="text-muted-foreground mb-4">Añade tu primer producto para empezar</p>
                  <Link
                    href="/products/new"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Añadir Producto
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nombre</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Facturación</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Gastos</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Beneficio</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Pedidos</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <Link href={`/products/${product.id}`} className="font-medium hover:text-primary">
                              {product.name}
                            </Link>
                          </td>
                          <td className="text-right py-3 px-4">{formatCurrency(product.totalRevenue)}</td>
                          <td className="text-right py-3 px-4 text-muted-foreground">
                            {formatCurrency(product.totalExpenses)}
                          </td>
                          <td
                            className={`text-right py-3 px-4 font-semibold ${product.totalProfit >= 0 ? "text-success" : "text-destructive"}`}
                          >
                            {formatCurrency(product.totalProfit)}
                          </td>
                          <td className="text-center py-3 px-4">{product.orderCount}</td>
                          <td className="text-center py-3 px-4">
                            <Badge variant={product.shopify_store_url ? "default" : "secondary"}>
                              {product.shopify_store_url ? "Conectado" : "Sin conectar"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
