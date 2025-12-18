import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTimeSeriesData, getProductComparisonData, getMonthlyData } from "@/lib/analytics"
import { TimeSeriesChart } from "@/components/time-series-chart"
import { ProductComparisonChart } from "@/components/product-comparison-chart"
import { MonthlyChart } from "@/components/monthly-chart"

export default async function ChartsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const timeSeriesData = await getTimeSeriesData(30)
  const productData = await getProductComparisonData()
  const monthlyData = await getMonthlyData()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gráficos y Análisis</h1>
            <p className="text-muted-foreground">Visualización detallada de tus métricas de negocio</p>
          </div>

          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución Últimos 30 Días</CardTitle>
              <CardDescription>Facturación, beneficios y gastos diarios</CardDescription>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={timeSeriesData} />
            </CardContent>
          </Card>

          {/* Monthly Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución Mensual</CardTitle>
              <CardDescription>Tendencias de los últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyChart data={monthlyData} />
            </CardContent>
          </Card>

          {/* Product Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Comparación por Producto</CardTitle>
              <CardDescription>Rendimiento de cada producto/tienda</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductComparisonChart data={productData} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
