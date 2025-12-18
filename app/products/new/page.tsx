"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  const [name, setName] = useState("")
  const [productCost, setProductCost] = useState("")
  const [shopifyStore, setShopifyStore] = useState("")
  const [shopifyToken, setShopifyToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("[v0] Getting authenticated user...")
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No autenticado. Por favor inicia sesión.")
      }

      console.log("[v0] User authenticated:", user.id)

      const { data: userExists, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (userCheckError || !userExists) {
        console.log("[v0] User not in public.users, creating...")
        const { error: createUserError } = await supabase.from("users").insert([{ id: user.id, email: user.email! }])

        if (createUserError) {
          console.error("[v0] Error creating user:", createUserError)
          throw new Error("Error al verificar usuario. Intenta cerrar sesión y volver a entrar.")
        }
      }

      console.log("[v0] Inserting product...")
      const { error: insertError } = await supabase.from("products").insert([
        {
          user_id: user.id,
          name,
          product_cost: Number.parseFloat(productCost) || 0,
          shopify_store_url: shopifyStore || null,
          shopify_access_token: shopifyToken || null,
          is_visible: true,
        },
      ])

      if (insertError) {
        console.error("[v0] Insert error:", insertError)
        throw insertError
      }

      console.log("[v0] Product created successfully")
      window.location.href = "/"
    } catch (err: any) {
      console.error("[v0] Error:", err)
      setError(err.message || "Error al crear el producto")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Nuevo Producto / Tienda
              </CardTitle>
              <CardDescription>Cada producto representa una nueva tienda de Shopify</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre del Producto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ej: Zapatillas Nike Air Max"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nombre se usará para identificar tu producto/tienda
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productCost">Costo del Producto (€)</Label>
                  <Input
                    id="productCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={productCost}
                    onChange={(e) => setProductCost(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Costo base del producto que se usará para calcular beneficios
                  </p>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-sm">Conexión con Shopify (Opcional)</h3>
                  <Alert>
                    <AlertDescription className="text-xs">
                      <strong>Webhooks:</strong> Después de crear el producto, configura un webhook en tu tienda Shopify
                      (Settings → Notifications → Webhooks) que apunte a{" "}
                      <code className="bg-muted px-1 py-0.5 rounded">/api/shopify-webhook</code> para sincronización
                      automática de pedidos.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="shopifyStore">URL de la Tienda Shopify</Label>
                    <Input
                      id="shopifyStore"
                      type="url"
                      placeholder="https://tu-tienda.myshopify.com"
                      value={shopifyStore}
                      onChange={(e) => setShopifyStore(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopifyToken">Token de Acceso de Shopify</Label>
                    <Input
                      id="shopifyToken"
                      type="password"
                      placeholder="shpat_xxxxx"
                      value={shopifyToken}
                      onChange={(e) => setShopifyToken(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Necesario para la sincronización de pedidos (API Admin de Shopify)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Creando..." : "Crear Producto"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
