"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pencil, Trash2 } from "lucide-react"

interface Order {
  id: string
  order_number: string | null
  revenue: number
  cost: number
  customer_email: string | null
  order_date: string
}

export function EditOrderForm({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)
  const [orderNumber, setOrderNumber] = useState(order.order_number || "")
  const [revenue, setRevenue] = useState(order.revenue.toString())
  const [cost, setCost] = useState(order.cost.toString())
  const [customerEmail, setCustomerEmail] = useState(order.customer_email || "")
  const [orderDate, setOrderDate] = useState(order.order_date.split("T")[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          order_number: orderNumber || null,
          revenue: Number.parseFloat(revenue),
          cost: Number.parseFloat(cost),
          customer_email: customerEmail || null,
          order_date: orderDate,
        })
        .eq("id", order.id)

      if (updateError) throw updateError

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al actualizar pedido")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este pedido?")) return

    setLoading(true)
    setError("")

    try {
      const { error: deleteError } = await supabase.from("orders").delete().eq("id", order.id)

      if (deleteError) throw deleteError

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al eliminar pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pedido</DialogTitle>
          <DialogDescription>Modifica los detalles del pedido</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="orderDate">Fecha del Pedido</Label>
            <Input
              id="orderDate"
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue">
              Facturación (€) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="revenue"
              type="number"
              step="0.01"
              placeholder="99.99"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">
              Costo del Pedido (€) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderNumber">Número de Pedido</Label>
            <Input
              id="orderNumber"
              placeholder="#1001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email del Cliente</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="cliente@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
