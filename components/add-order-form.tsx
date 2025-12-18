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
import { Plus } from "lucide-react"

export function AddOrderForm({ productId, productCost }: { productId: string; productCost: number }) {
  const [open, setOpen] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [revenue, setRevenue] = useState("")
  const [cost, setCost] = useState(productCost.toString())
  const [customerEmail, setCustomerEmail] = useState("")
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: insertError } = await supabase.from("orders").insert([
        {
          product_id: productId,
          order_number: orderNumber || null,
          revenue: Number.parseFloat(revenue),
          cost: Number.parseFloat(cost),
          customer_email: customerEmail || null,
          order_date: orderDate,
        },
      ])

      if (insertError) throw insertError

      setOpen(false)
      setOrderNumber("")
      setRevenue("")
      setCost(productCost.toString())
      setCustomerEmail("")
      setOrderDate(new Date().toISOString().split("T")[0])
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al añadir pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Pedido
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Pedido</DialogTitle>
          <DialogDescription>Añade un pedido manualmente para este producto</DialogDescription>
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
            <p className="text-xs text-muted-foreground">
              Por defecto usa el costo del producto, pero puedes modificarlo
            </p>
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
              {loading ? "Añadiendo..." : "Añadir Pedido"}
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
