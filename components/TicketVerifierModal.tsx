'use client'

import { useState } from 'react'
import { X, Search, AlertCircle } from 'lucide-react'

interface TicketVerifierModalProps {
  isOpen: boolean
  onClose: () => void
  onVerifyTickets: (idType: string, idNumber: string) => Promise<any>
}

export default function TicketVerifierModal({ 
  isOpen, 
  onClose, 
  onVerifyTickets 
}: TicketVerifierModalProps) {
  const [idType, setIdType] = useState('V')
  const [idNumber, setIdNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleVerify = async () => {
    if (!idNumber.trim()) {
      setError('Por favor ingresa tu número de cédula')
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const result = await onVerifyTickets(idType, idNumber.trim())
      setTickets(result.tickets || [])
      
      if (result.tickets && result.tickets.length === 0) {
        setError('No se encontraron boletos con esa cédula')
      }
    } catch (error) {
      console.error('Error verificando boletos:', error)
      setError('Error al verificar los boletos. Intenta nuevamente.')
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIdNumber('')
    setTickets([])
    setError(null)
    setHasSearched(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white text-lg font-semibold">Ver mis boletos comprados</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Instructions */}
          <p className="text-gray-300 text-sm">
            Escribe el número de cédula que usaste al comprar tus boletos (no el del pago móvil)
          </p>

          {/* ID Input */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Cédula</label>
            <div className="flex space-x-2">
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none"
              >
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="J">J</option>
                <option value="P">P</option>
              </select>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Escribe tu cédula"
                className="flex-1 bg-gray-600 text-white rounded-lg px-3 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none placeholder-gray-400"
                maxLength={8}
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Ver boletos</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Tickets Results */}
          {hasSearched && tickets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Tus boletos comprados:</h3>
              <div className="space-y-2">
                {tickets.map((ticket, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-white font-medium">{ticket.raffleTitle}</p>
                        <p className="text-gray-300 text-sm">
                          Números: <span className="text-green-400 font-semibold">{ticket.assignedNumbers?.map(n => n.toString().padStart(6, '0')).join(', ') || 'N/A'}</span>
                        </p>
                        <p className="text-gray-400 text-xs">
                          Fecha: {new Date(ticket.createdAt).toLocaleDateString('es-VE')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs px-2 py-1 rounded-full ${
                          ticket.status === 'approved' 
                            ? 'bg-green-900 text-green-300' 
                            : ticket.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {ticket.status === 'approved' ? 'Aprobado' : 
                           ticket.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No tickets found */}
          {hasSearched && tickets.length === 0 && !error && (
            <div className="text-center py-6">
              <p className="text-gray-400">No se encontraron boletos comprados con esa cédula</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
