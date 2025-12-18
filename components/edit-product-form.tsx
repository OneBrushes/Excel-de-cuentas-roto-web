"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit } from "lucide-react"
import type { Product } from "@/lib/types"

export function EditProductForm({ product }: { product: Product }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(product.name)
  const [productCost, setProductCost] = useState(product.product_cost.toString())
  const [shopifyStore, setShopifyStore] = useState(product.shopify_store_url || "")
  const [shopifyToken, setShopifyToken] = useState(product.shopify_access_token || "")
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
        .from("products")
        .update({
          name,
          product_cost: Number.parseFloat(productCost),
          shopify_store_url: shopifyStore || null,
          shopify_access_token: shopifyToken || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id)

      if (updateError) throw updateError

      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al actualizar")
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
        <Edit className="h-4 w-4 mr-2" />
        Editar Información
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit-name">Nombre del Producto</Label>
        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-cost">Costo del Producto (€)</Label>
        <Input
          id="edit-cost"
          type="number"
          step="0.01"
          value={productCost}
          onChange={(e) => setProductCost(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-shopify">URL de Shopify</Label>
        <Input id="edit-shopify" type="url" value={shopifyStore} onChange={(e) => setShopifyStore(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-token">Token de Shopify</Label>
        <Input
          id="edit-token"
          type="password"
          value={shopifyToken}
          onChange={(e) => setShopifyToken(e.target.value)}
          placeholder="Dejar vacío para no cambiar"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
