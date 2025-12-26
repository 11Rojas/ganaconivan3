"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { Raffle } from "@/lib/types"

interface FullScreenModalProps {
  raffle: Raffle
  quantity: number
  exchangeRate: number
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
}

export default function FullScreenModal({ 
  raffle, 
  quantity, 
  exchangeRate, 
  isOpen, 
  onClose,
  onContinue
}: FullScreenModalProps) {
  if (!isOpen) return null

  const ticketPriceInBs = raffle.ticketPrice
  const totalPrice = ticketPriceInBs * quantity

  const handleContinue = () => {
    // Validar que el monto sea válido
    if (totalPrice <= 0) {
      alert('Error: El monto total debe ser mayor a 0')
      return
    }
    
    if (quantity <= 0) {
      alert('Error: La cantidad de boletos debe ser mayor a 0')
      return
    }
    
    console.log('Verificación de monto completada:', {
      raffle: raffle.title,
      quantity,
      ticketPrice: ticketPriceInBs,
      totalPrice,
      exchangeRate
    })
    
    onContinue()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-16">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <h2 className="text-white text-lg font-bold text-center mb-8">
            Verifica el monto antes de continuar
          </h2>

          {/* Summary */}
          <div className="bg-gray-800 rounded-lg p-4 mb-16">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Precio por boleto</span>
                <span className="text-white font-medium">Bs. {ticketPriceInBs.toLocaleString("es-VE", { minimumFractionDigits: 1 })}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Cantidad de boletos</span>
                <span className="text-white font-medium">{quantity}</span>
              </div>
              
              <div className="border-t border-gray-600 my-3"></div>
              
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-base">Total a pagar</span>
                <span className="text-white font-bold text-lg">Bs. {totalPrice.toLocaleString("es-VE", { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Continue Button - Posición equilibrada */}
          <button
            onClick={handleContinue}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg transition-colors mb-6"
          >
            Continuar
          </button>

          {/* Terms */}
          <p className="text-gray-400 text-xs text-center leading-relaxed">
            Al presionar "Continuar" declaras haber leído y aceptado nuestros{" "}
            <span className="text-green-400">Términos y condiciones</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
