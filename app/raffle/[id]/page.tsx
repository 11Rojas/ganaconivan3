'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Minus, Plus, ArrowRight, ArrowLeft, Clock } from "lucide-react"
import type { Raffle } from "@/lib/types"
import { getImageUrl } from "@/lib/imageUtils"
import ParticipationModal from "@/components/ParticipationModal"
import FullScreenModal from "@/components/FullScreenModal"
import PaymentScreen from "@/components/PaymentScreen"
import PersonalDataForm from "@/components/PersonalDataForm"
import TicketVerifierModal from "@/components/TicketVerifierModal"
import WhatsApp from "@/components/Whatsapp"

export default function RaffleDetailPage() {
  const params = useParams()
  const raffleId = params.id as string
  
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [otherRaffles, setOtherRaffles] = useState<Raffle[]>([])
  const [exchangeRate, setExchangeRate] = useState(36)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [showParticipationModal, setShowParticipationModal] = useState(false)
  const [showFullScreenModal, setShowFullScreenModal] = useState(false)
  const [showPaymentScreen, setShowPaymentScreen] = useState(false)
  const [showPersonalDataForm, setShowPersonalDataForm] = useState(false)
  const [showTicketVerifier, setShowTicketVerifier] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRaffleData = async () => {
      try {
        setLoading(true)
        
        // Get raffle details
        const raffleResponse = await fetch(`/api/raffles/${raffleId}`)
        if (!raffleResponse.ok) throw new Error("Error al cargar la rifa")
        const raffleData = await raffleResponse.json()
        setRaffle(raffleData)
        // Set initial quantity based on minTickets
        setSelectedQuantity(raffleData.minTickets || 1)

        // Get exchange rate
        const exchangeResponse = await fetch("/api/exchange-rate")
        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json()
          setExchangeRate(exchangeData.rate || 36)
        }

        // Get other active raffles (excluding current one)
        const otherRafflesResponse = await fetch("/api/raffles/active")
        if (otherRafflesResponse.ok) {
          const otherRafflesData = await otherRafflesResponse.json()
          // Filter out current raffle
          const filteredRaffles = otherRafflesData.filter((r: Raffle) => r._id !== raffleId)
          console.log('Other raffles data from API:', filteredRaffles);
          setOtherRaffles(filteredRaffles)
        }
      } catch (err) {
        console.error("Error fetching raffle data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (raffleId) {
      fetchRaffleData()
    }
  }, [raffleId])

  const ticketPriceInBs = raffle ? raffle.ticketPrice : 0
  const totalPrice = ticketPriceInBs * selectedQuantity
  const minTickets = raffle?.minTickets || 1
  // Crear opciones de cantidad: incluir mínimo, 10, 25, 50, 100, 250
  const baseOptions = [10, 25, 50, 100, 250]
  const quantityOptions = [...new Set([minTickets, ...baseOptions])]
    .filter(q => q >= minTickets)
    .sort((a, b) => a - b)

  const handleQuantityChange = (quantity: number) => {
    setSelectedQuantity(quantity)
  }

  const incrementQuantity = () => {
    setSelectedQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (selectedQuantity > minTickets) {
      setSelectedQuantity(prev => prev - 1)
    }
  }

  const handleReportPayment = () => {
    // Guardar paso 4 en localStorage antes de abrir ParticipationModal (paso del ReceiptCaptureScreen)
    if (typeof window !== 'undefined') {
      localStorage.setItem('participationStep', '4')
    }
    setShowPaymentScreen(false)
    setShowParticipationModal(true)
  }

  const handlePersonalDataSubmit = (data: any) => {
    // Guardar personalData en localStorage para que ParticipationModal pueda usarlo
    if (typeof window !== 'undefined') {
      localStorage.setItem('personalData', JSON.stringify(data))
      localStorage.setItem('participationStep', '3')
    }
    setShowPersonalDataForm(false)
    setShowPaymentScreen(true)
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

  const formatDrawDate = (date: Date) => {
    return date.toLocaleDateString("es-VE", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric" 
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1a1f27] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white">Cargando rifa...</p>
        </div>
      </main>
    )
  }

  if (!raffle) {
    return (
      <main className="min-h-screen bg-[#1a1f27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Rifa no encontrada</p>
          <Link href="/" className="text-green-400 hover:text-green-300">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1f27] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1a1f27]">
        <Link href="/" className="flex items-center space-x-2">
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Volver</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTicketVerifier(true)}
            className="flex items-center space-x-1 text-white hover:text-green-400 transition-colors"
          >
            <span className="text-sm">Verificador</span>
          </button>
          
          <a 
            href="https://wa.me/584127452761" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-white hover:text-[#25D366] transition-colors"
          >
            <WhatsApp />
            <span className="text-sm">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Main Image Section */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        <Image
          src={raffle.image || "/placeholder.svg"}
          alt={raffle.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Participate Button */}
        <div className="absolute bottom-4 left-4">
          <button 
            onClick={() => setShowFullScreenModal(true)}
            className="text-black px-4 py-2 rounded-lg font-semibold transition-colors text-sm border border-transparent"
            style={{ backgroundColor: '#16DB65' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#14C85A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16DB65'}
          >
            Participa ahora
          </button>
        </div>
      </div>

      {/* Prize Description Section */}
      <div className="bg-[#1a1f27] p-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-white font-bold text-lg uppercase leading-tight">
            {raffle.description}
          </h2>
          <div className="flex items-center mt-1">
            <Clock className="w-3 h-3 text-white mr-1" />
            <span className="text-white text-xs">10PM</span>
          </div>
        </div>
      </div>

      {/* Date and Ticket Price Section */}
      <div className="bg-[#1a1f27] p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="bg-[#00D3441F] px-3 py-2 rounded-lg flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-[#16DB65] text-sm font-medium">
              {formatDrawDate(new Date(raffle.drawDate))}
            </span>
          </div>
          
          <div className="text-white text-right">
            <div className="text-sm">Boleto</div>
            <div className="font-bold text-lg">Bs. {ticketPriceInBs.toLocaleString("es-VE", { minimumFractionDigits: 1 })}</div>
          </div>
        </div>
      </div>

      {/* Quantity Selection and Controls */}
      <div className="bg-[#00D3440D] p-4 space-y-4">
        {/* Quantity Selection Grid */}
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {quantityOptions.map((quantity) => (
              <button
                key={quantity}
                onClick={() => handleQuantityChange(quantity)}
                className={`p-6 rounded-lg font-bold transition-all border ${
                  selectedQuantity === quantity
                    ? "text-white border-white"
                    : "bg-gray-800 border-white text-white hover:bg-gray-700"
                }`}
                style={selectedQuantity === quantity ? { backgroundColor: '#16DB65' } : {}}
              >
                <div className="text-3xl font-bold">{quantity}</div>
                {quantity === minTickets && minTickets > 1 && (
                  <div className="text-xs text-gray-200 mt-1">Mínimo</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={decrementQuantity}
                disabled={selectedQuantity <= minTickets}
                className="w-12 h-12 bg-gray-800 border-r border-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              
              <div className="w-16 h-12 bg-gray-800 border-r border-gray-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{selectedQuantity}</span>
              </div>
              
              <button
                onClick={incrementQuantity}
                className="w-12 h-12 bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Final Participate Button */}
            <button 
              onClick={() => setShowFullScreenModal(true)}
              className="text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors border border-transparent"
              style={{ backgroundColor: '#16DB65' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#14C85A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16DB65'}
            >
              <span>Participar</span>
              <span className="text-sm">Bs. {totalPrice.toLocaleString("es-VE", { minimumFractionDigits: 1 })}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Other Raffles Section */}
      {otherRaffles.length > 0 && (
        <div className="bg-[#1a1f27] p-4">
          <h3 className="text-white text-lg font-bold text-center mb-4">
            Echa un vistazo a nuestros últimos sorteos
          </h3>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {otherRaffles.map((otherRaffle) => (
              <div key={otherRaffle._id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="relative h-32">
                  <Image
                    src={otherRaffle.image || "/placeholder.jpg"}
                    alt={otherRaffle.title}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={(e) => {
                      console.log('Error cargando imagen:', otherRaffle.image);
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-white font-bold text-sm mb-2 line-clamp-2">
                    {otherRaffle.title}
                  </h4>
                  <div className="text-green-400 text-xs mb-2">
                    Bs. {otherRaffle.ticketPrice.toLocaleString("es-VE", { minimumFractionDigits: 1 })}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowTicketVerifier(true)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded text-center transition-colors"
                    >
                      Verificar
                    </button>
                    <Link
                      href={`/raffle/${otherRaffle._id}`}
                      className="flex-1 text-white text-xs py-2 px-3 rounded text-center transition-colors border border-transparent"
                      style={{ backgroundColor: '#16DB65' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#14C85A'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16DB65'}
                    >
                      Comprar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Screen Modal */}
      <FullScreenModal
        raffle={raffle}
        quantity={selectedQuantity}
        exchangeRate={exchangeRate}
        isOpen={showFullScreenModal}
        onClose={() => setShowFullScreenModal(false)}
        onContinue={() => {
          setShowFullScreenModal(false)
          setShowPersonalDataForm(true)
        }}
      />

      {/* Payment Screen */}
      <PaymentScreen
        isOpen={showPaymentScreen}
        onClose={() => setShowPaymentScreen(false)}
        onReportPayment={handleReportPayment}
        totalAmount={totalPrice}
        raffleTitle={raffle.title}
      />

      {/* Personal Data Form */}
      <PersonalDataForm
        isOpen={showPersonalDataForm}
        onClose={() => setShowPersonalDataForm(false)}
        onBack={() => {
          setShowPersonalDataForm(false)
          setShowFullScreenModal(true)
        }}
        onPay={handlePersonalDataSubmit}
      />

      {/* Participation Modal */}
      <ParticipationModal
        raffle={raffle}
        quantity={selectedQuantity}
        exchangeRate={exchangeRate}
        isOpen={showParticipationModal}
        onClose={() => setShowParticipationModal(false)}
      />

      {/* Ticket Verifier Modal */}
      <TicketVerifierModal
        isOpen={showTicketVerifier}
        onClose={() => setShowTicketVerifier(false)}
        onVerifyTickets={handleVerifyTickets}
      />
    </div>
  )
}
