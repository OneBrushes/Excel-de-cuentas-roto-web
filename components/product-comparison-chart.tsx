"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ProductChartData } from "@/lib/analytics"

export function ProductComparisonChart({ data }: { data: ProductChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No hay productos para comparar
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <ChartContainer
      config={{
        revenue: {
          label: "Facturación",
          color: "hsl(var(--chart-1))",
        },
        profit: {
          label: "Beneficio",
          color: "hsl(var(--chart-2))",
        },
        expenses: {
          label: "Gastos",
          color: "hsl(var(--chart-3))",
        },
      }}
      className="h-[400px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="productName" className="text-xs" />
          <YAxis tickFormatter={formatCurrency} className="text-xs" />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" name="Facturación" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit" fill="var(--color-profit)" name="Beneficio" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" name="Gastos" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
