"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Smartphone, CreditCard, User } from "lucide-react"
import { toast } from "sonner"

interface PaymentConfig {
  cedula: string
  phone: string
  bank: string
}

export default function PaymentConfigManager() {
  const [config, setConfig] = useState<PaymentConfig>({
    cedula: "",
    phone: "",
    bank: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/payment-config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        toast.error("Error al cargar la configuración")
      }
    } catch (error) {
      console.error("Error fetching config:", error)
      toast.error("Error al cargar la configuración")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config.cedula || !config.phone || !config.bank) {
      toast.error("Todos los campos son requeridos")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/payment-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast.success("Configuración de pago móvil actualizada correctamente")
        // Recargar la página después de un momento para reflejar los cambios
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al guardar la configuración")
      }
    } catch (error) {
      console.error("Error saving config:", error)
      toast.error("Error al guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Configuración de Pago Móvil</h1>
          <p className="text-sm sm:text-base text-gray-400">Gestiona los datos de pago móvil para las transferencias</p>
        </div>
      </div>

      {/* Config Form */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-white text-base sm:text-lg flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-yellow-400" />
            Datos de Pago Móvil
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-4">
          {/* Cédula */}
          <div className="space-y-2">
            <Label htmlFor="cedula" className="text-white flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              Cédula
            </Label>
            <Input
              id="cedula"
              type="text"
              value={config.cedula}
              onChange={(e) => setConfig({ ...config, cedula: e.target.value })}
              placeholder="Ej: 30744670"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white flex items-center">
              <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
              Número de Teléfono
            </Label>
            <Input
              id="phone"
              type="text"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              placeholder="Ej: 04249172493"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Banco */}
          <div className="space-y-2">
            <Label htmlFor="bank" className="text-white flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
              Banco
            </Label>
            <Input
              id="bank"
              type="text"
              value={config.bank}
              onChange={(e) => setConfig({ ...config, bank: e.target.value })}
              placeholder="Ej: 0104 Venezolano de Crédito"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <CardContent className="px-4 sm:px-6 py-4">
          <p className="text-sm text-blue-300">
            <strong>Nota:</strong> Los cambios en esta configuración se reflejarán automáticamente en los componentes de pago móvil.
            Los usuarios verán estos datos cuando realicen una compra.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

