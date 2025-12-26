'use client'

import { useState, useRef } from 'react'
import { X, Upload, Camera, FileText } from 'lucide-react'
import Image from 'next/image'

interface PersonalData {
  fullName: string
  idType: string
  idNumber: string
  phone: string
  email: string
}

interface ReceiptCaptureScreenProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  onSubmit: (receiptData: { reference: string; receipt: File | null }) => void
  totalAmount: number
  raffleTitle: string
  personalData?: PersonalData | null
}

export default function ReceiptCaptureScreen({ 
  isOpen, 
  onClose, 
  onBack,
  onSubmit,
  totalAmount,
  raffleTitle,
  personalData
}: ReceiptCaptureScreenProps) {
  const [reference, setReference] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      
      // Crear preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async () => {
    if (!reference.trim()) {
      alert('Por favor ingresa la referencia del pago')
      return
    }

    if (!receiptFile) {
      alert('Por favor selecciona una imagen del comprobante')
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit({ reference: reference.trim(), receipt: receiptFile })
    } catch (error) {
      console.error('Error submitting receipt:', error)
      alert('Error al enviar el comprobante')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-800 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-700">
        <button
          onClick={onBack}
          className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-white text-lg font-semibold">Comprobante de Pago</h1>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 bg-gray-800 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Resumen de compra */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h2 className="text-white text-lg font-semibold mb-3">Resumen de tu compra</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Rifa:</span>
                <span className="text-white">{raffleTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Monto:</span>
                <span className="text-white font-semibold">
                  Bs. {totalAmount.toLocaleString("es-VE", { minimumFractionDigits: 0 })}
                </span>
              </div>
              {personalData && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Comprador:</span>
                  <span className="text-white">{personalData.fullName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Referencia del pago */}
          <div>
            <label className="text-white text-sm block mb-2">
              Referencia del pago móvil *
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: 1234567890"
              className="w-full bg-gray-600 text-white rounded-lg px-4 py-3 border border-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-gray-400 text-xs mt-1">
              Ingresa la referencia que aparece en tu comprobante de pago móvil
            </p>
          </div>

          {/* Captura de comprobante */}
          <div>
            <label className="text-white text-sm block mb-2">
              Comprobante de pago *
            </label>
            
            {/* Preview o placeholder */}
            <div className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-3">
                  <div className="relative mx-auto max-w-xs">
                    <Image
                      src={previewUrl}
                      alt="Preview del comprobante"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover mx-auto"
                    />
                  </div>
                  <p className="text-green-400 text-sm">✓ Comprobante seleccionado</p>
                  <button
                    onClick={() => {
                      setReceiptFile(null)
                      setPreviewUrl(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-red-400 text-sm hover:text-red-300"
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleCameraClick}
                      className="flex flex-col items-center space-y-2 p-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      <Camera className="w-8 h-8 text-white" />
                      <span className="text-white text-sm">Tomar foto</span>
                    </button>
                    <button
                      onClick={handleCameraClick}
                      className="flex flex-col items-center space-y-2 p-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      <FileText className="w-8 h-8 text-white" />
                      <span className="text-white text-sm">Seleccionar</span>
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Toma una foto o selecciona el comprobante de tu pago móvil
                  </p>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Información importante */}
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
            <h3 className="text-blue-300 text-sm font-semibold mb-2">Información importante:</h3>
            <ul className="text-blue-200 text-xs space-y-1">
              <li>• Asegúrate de que la referencia sea correcta</li>
              <li>• La imagen debe ser clara y legible</li>
              <li>• Tu compra será verificada antes de la asignación de números</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reference.trim() || !receiptFile}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar comprobante'}
            </button>
            
            <button
              onClick={onBack}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
