
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Copy, Info } from 'lucide-react'

interface PersonalData {
  fullName: string
  idType: string
  idNumber: string
  phone: string
  email: string
}

interface PaymentScreenProps {
  isOpen: boolean
  onClose: () => void
  onReportPayment: () => void
  totalAmount: number
  raffleTitle: string
  personalData?: PersonalData | null
}

export default function PaymentScreen({ 
  isOpen, 
  onClose, 
  onReportPayment, 
  totalAmount,
  raffleTitle,
  personalData
}: PaymentScreenProps) {
  const [timeLeft, setTimeLeft] = useState(10 * 60) // 10 minutos en segundos
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Datos de pago móvil reales (del modal anterior)
  const paymentData = {
    bank: "0104 Venezolano de Crédito",
    phone: "04249172493",
    cedula: "30744670"
  }

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(10 * 60)
    }
  }, [isOpen])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      
      // Mostrar mensaje de confirmación
      const fieldNames: Record<string, string> = {
        'amount': 'Monto',
        'phone': 'Teléfono',
        'cedula': 'Cédula'
      }
      
      alert(`${fieldNames[field] || field} copiado al portapapeles`)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      alert('Error al copiar al portapapeles')
    }
  }

  const handleReportPayment = () => {
    console.log('Reportando pago, pasando a pantalla de captura')
    // Solo llamar al callback, no enviar a la API aún
    onReportPayment()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-800 z-50 flex flex-col">
      {/* Close Button - Solo el botón X */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pt-16 pb-4 bg-gray-800">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <h1 className="text-white text-xl font-bold text-center mb-4">
            Realiza el pago móvil
          </h1>

          {/* Timer Warning */}
          <div className="text-center mb-6">
            <p className="text-white text-sm mb-3">
              Tienes <span className="font-bold">10 minutos</span> para realizar y reportar el pago o la operación se cancelará.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-orange-400 font-bold text-lg">
                {formatTime(timeLeft)} min.
              </span>
            </div>
          </div>

          {/* Amount to Pay */}
          <div className="mb-6">
            <label className="text-white text-sm block mb-2">Monto exacto a pagar</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-500 rounded-lg px-4 py-3">
                <span className="text-white font-bold text-lg">
                  Bs. {totalAmount.toLocaleString("es-VE", { minimumFractionDigits: 0 })}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(totalAmount.toString(), 'amount')}
                className={`px-4 py-3 rounded-lg transition-colors ${
                  copiedField === 'amount' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copiedField === 'amount' ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3 mb-6">
            {/* Banco */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Banco:</span>
              <div className="flex items-center space-x-2">
                <Image
                  src="/bancodevenezuela.png"
                  alt="Banco de Venezuela"
                  width={24}
                  height={12}
                  className="object-contain"
                />
                <span className="text-white text-sm">{paymentData.bank}</span>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Teléfono:</span>
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">{paymentData.phone}</span>
                <button
                  onClick={() => copyToClipboard(paymentData.phone, 'phone')}
                  className={`transition-colors ${
                    copiedField === 'phone' 
                      ? 'text-green-300' 
                      : 'text-green-400 hover:text-green-300'
                  }`}
                >
                  {copiedField === 'phone' ? '✓' : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Cédula */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Cédula:</span>
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">{paymentData.cedula}</span>
                <button
                  onClick={() => copyToClipboard(paymentData.cedula, 'cedula')}
                  className={`transition-colors ${
                    copiedField === 'cedula' 
                      ? 'text-green-300' 
                      : 'text-green-400 hover:text-green-300'
                  }`}
                >
                  {copiedField === 'cedula' ? '✓' : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

       

          {/* Report Payment Button */}
          <button
            onClick={handleReportPayment}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg transition-colors"
          >
            Reportar pago
          </button>
        </div>
      </div>
    </div>
  )
}
