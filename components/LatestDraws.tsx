"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Gift, Tag, ChevronLeft, ChevronRight, CheckCircle, ShoppingCart } from "lucide-react"
import type { Raffle } from "@/lib/types"
import TicketVerifierModal from "./TicketVerifierModal"
import { getImageUrl } from "@/lib/imageUtils"

export default function LatestDraws() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showTicketVerifier, setShowTicketVerifier] = useState(false)

  useEffect(() => {
    fetchCompletedRaffles()
  }, [currentPage])

  const fetchCompletedRaffles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/raffles/completed?page=${currentPage}&limit=2`)
      const data = await response.json()
      
      if (data.success) {
        setRaffles(data.raffles)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error("Error fetching completed raffles:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleVerifyTickets = async (idType: string, idNumber: string) => {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idType, idNumber }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al verificar boletos')
    }

    return await response.json()
  }

  if (loading) {
    return (
      <section className="bg-black py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-white">Cargando sorteos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (raffles.length === 0) {
    return null
  }

  return (
    <section className="bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-lg transition-colors">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="font-medium">Premios</span>
          </button>
          
          <button className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-lg transition-colors">
            <Tag className="w-5 h-5 text-green-400" />
            <span className="font-medium">Ver boletos comprados</span>
          </button>
        </div>

        {/* Section Title */}
        <h2 className="text-white text-xl font-bold mb-6 text-center">
          Echa un vistazo a nuestros últimos sorteos
        </h2>

        {/* Raffle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {raffles.map((raffle) => (
            <div key={raffle._id} className="bg-gray-900 rounded-lg overflow-hidden">
              {/* Image */}
              <div className="relative h-48">
                <Image
                  src={getImageUrl(raffle.image, "/placeholder.svg")}
                  alt={raffle.title}
                  fill
                  className="object-cover"
                />
                
                {/* Overlay Banner */}
                <div className="absolute top-4 right-4 transform rotate-12">
                  <div className="bg-white text-black px-3 py-1 rounded-lg shadow-lg">
                    <span className="font-bold text-sm">{raffle.title}</span>
                  </div>
                </div>

                {/* Completed Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Finalizado</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-white font-bold text-lg mb-2">{raffle.title}</h3>
                <p className="text-gray-300 mb-4">
                  {raffle.description}
                </p>

                {/* Raffle Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="text-gray-400">
                    Boletos vendidos: <span className="text-white font-medium">{(raffle as any).soldCount || 0}</span>
                  </div>
                  <div className="text-gray-400">
                    Precio: <span className="text-white font-medium">Bs. {raffle.ticketPrice?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {new Date(raffle.drawDate).toLocaleDateString('es-ES', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                {/* Winner Info (if available) */}
                {raffle.winner && (
                  <div className="mb-4 p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                    <p className="text-green-400 text-sm font-medium mb-1">¡Ganador!</p>
                    <p className="text-white text-sm">{raffle.winner.userName}</p>
                    <p className="text-gray-300 text-xs">Número ganador: {raffle.winner.winningNumber}</p>
                  </div>
                )}

                {/* Action Links */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowTicketVerifier(true)}
                    className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
                  >
                    Verificar boletos
                  </button>
                  <Link
                    href={`/raffle/${raffle._id}`}
                    className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium flex items-center space-x-1"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Ver detalles</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-white text-sm">
              {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Ticket Verifier Modal */}
      <TicketVerifierModal
        isOpen={showTicketVerifier}
        onClose={() => setShowTicketVerifier(false)}
        onVerifyTickets={handleVerifyTickets}
      />
    </section>
  )
}
