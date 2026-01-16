'use client'

import { useState, useEffect } from 'react'
import { X, Trophy, Clock, Gift } from 'lucide-react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/imageUtils'

interface Winner {
  _id: string
  name: string
  phone: string
  email: string
  ticketNumber: string
  prizeAmount: number
  prizePosition: number
  image?: string
}

interface CompletedRaffle {
  _id: string
  title: string
  description: string
  endDate: string
  winners: Winner[]
  totalTickets: number
  ticketPrice: number
  image?: string
}

interface PrizesModalProps {
  isOpen: boolean
  onClose: () => void
  onGetCompletedRaffles: () => Promise<CompletedRaffle[]>
}

export default function PrizesModal({ 
  isOpen, 
  onClose, 
  onGetCompletedRaffles 
}: PrizesModalProps) {
  const [completedRaffles, setCompletedRaffles] = useState<CompletedRaffle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCompletedRaffles()
    }
  }, [isOpen])

  const loadCompletedRaffles = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const raffles = await onGetCompletedRaffles()
      setCompletedRaffles(raffles)
    } catch (error) {
      console.error('Error cargando rifas completadas:', error)
      setError('Error al cargar los premios sorteados')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getPositionText = (position: number) => {
    switch (position) {
      case 1: return '1ER LUGAR'
      case 2: return '2DO LUGAR'
      case 3: return '3ER LUGAR'
      default: return `${position}° LUGAR`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Premios sorteados</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white ml-3">Cargando premios...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadCompletedRaffles}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : completedRaffles.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No hay premios sorteados aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedRaffles.map((raffle) => (
                <div key={raffle._id} className="bg-gray-700 rounded-lg p-4">
                  {/* Raffle Info */}
                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-lg mb-2">{raffle.title}</h3>
                    <p className="text-gray-300 text-sm mb-2">{raffle.description}</p>
                    <div className="flex items-center space-x-4 text-gray-400 text-sm">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Finalizó: {formatDate(raffle.endDate)}</span>
                      </span>
                      <span>•</span>
                      <span>Total boletos: {raffle.totalTickets}</span>
                    </div>
                  </div>

                  {/* Winners */}
                  <div className="space-y-3">
                    {raffle.winners.map((winner, index) => (
                      <div key={winner._id} className="bg-gray-600 rounded-lg p-3 flex items-center space-x-3">
                        {/* Winner Image */}
                        <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          {winner.image ? (
                            <Image
                              src={getImageUrl(winner.image)}
                              alt={winner.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {winner.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Winner Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{winner.name}</p>
                              <p className="text-gray-300 text-sm">Boletos: {winner.ticketNumber}</p>
                            </div>
                            <div className="text-right">
                              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-1">
                                Premio n° {winner.prizePosition} | {formatTime(raffle.endDate)}
                              </div>
                              <p className="text-green-400 font-semibold">
                                {getPositionText(winner.prizePosition)} {winner.prizeAmount.toLocaleString('es-VE')}$
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
