'use client'

import { X } from 'lucide-react'
import Image from 'next/image'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
  ticketNumbers: string[]
  raffleTitle: string
}

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  onComplete,
  ticketNumbers, 
  raffleTitle 
}: SuccessModalProps) {
  console.log('SuccessModal renderizado - isOpen:', isOpen, 'ticketNumbers:', ticketNumbers)
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-sm w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto relative">
              <Image
                src="/logo.png"
                alt="GANACOMIVAN"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-white text-xl font-bold mb-4">
            ¡Compra exitosa!
          </h2>

          {/* Ticket Numbers */}
          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-3">
              Tus números de boletos para <span className="font-semibold text-white">{raffleTitle}</span>:
            </p>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                {ticketNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-center text-lg"
                  >
                    {number}
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-xs text-center mt-3">
                Guarda estos números, son tus boletos de participación
              </p>
            </div>
          </div>

          {/* Close Buttons */}
          <div className="space-y-2">
            <button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Ver más rifas
            </button>
            {onComplete && (
              <button
                onClick={onComplete}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
