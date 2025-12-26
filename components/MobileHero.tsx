"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Moon, Send, Calendar, Minus, Plus, ArrowRight, Ticket, Clock, Gift, Tag } from "lucide-react"
import { siteConfig } from "@/config/site"
import type { Raffle } from "@/lib/types"
import ParticipationModal from "./ParticipationModal"
import FullScreenModal from "./FullScreenModal"
import PaymentScreen from "./PaymentScreen"
import PersonalDataForm from "./PersonalDataForm"
import TicketVerifierModal from "./TicketVerifierModal"
import PrizesModal from "./PrizesModal"
import { Telegram } from "./Telegram"

interface MobileHeroProps {
  raffle: Raffle
  exchangeRate: number
  otherRaffles?: Raffle[]
}

export default function MobileHero({ raffle, exchangeRate, otherRaffles = [] }: MobileHeroProps) {
  const minTickets = raffle.minTickets || 1
  const [selectedQuantity, setSelectedQuantity] = useState(minTickets)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showParticipationModal, setShowParticipationModal] = useState(false)
  const [showFullScreenModal, setShowFullScreenModal] = useState(false)
  const [showPaymentScreen, setShowPaymentScreen] = useState(false)
  const [showPersonalDataForm, setShowPersonalDataForm] = useState(false)
  const [showTicketVerifier, setShowTicketVerifier] = useState(false)
  const [showPrizesModal, setShowPrizesModal] = useState(false)

  const ticketPriceInBs = raffle.ticketPrice
  const totalPrice = ticketPriceInBs * selectedQuantity

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

  const handleGetCompletedRaffles = async () => {
    const response = await fetch('/api/prizes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al cargar premios')
    }

    const data = await response.json()
    return data.raffles || []
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

  // Formatear fecha como en la imagen
  const formatDrawDate = (date: Date) => {
    return date.toLocaleDateString("es-VE", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric" 
    })
  }
//4
  return (
    <div className="min-h-screen bg-[#1a1f27] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1a1f27]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 relative">
            <Image
              src="/logo.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
       
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <Moon className="w-5 h-5 text-white" />
          </button>
          
          <a 
            href="https://t.me/+584166571872" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-white hover:text-[#0088cc] transition-colors"
          >
            <Telegram />
            <span className="text-sm hidden sm:inline">Telegram</span>
          </a>
        </div>
      </header>

      {/* Main Image Section */}
      <div className="relative w-full h-[25vh] overflow-hidden">
        <Image
          src={raffle.image || "/placeholder.svg"}
          alt={raffle.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Participate Button - Posicionado exactamente como en la imagen */}
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
                className={`p-6 rounded-lg font-bold transition-all ${
                  selectedQuantity === quantity
                    ? "text-white border border-white"
                    : "bg-gray-800 border border-white text-white hover:bg-gray-700"
                }`}
                style={selectedQuantity === quantity ? { backgroundColor: '#16DB65' } : {}}
              >
                <div className="text-3xl font-bold ">{quantity}</div>
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

      {/* Additional Sections */}
      <div className="bg-[#1a1f27] p-4 space-y-3">
        <div className="max-w-md mx-auto space-y-3">
          {/* Premios Section */}
          <button
            onClick={() => setShowPrizesModal(true)}
            className="w-full bg-gray-800 border border-white rounded-lg py-2 px-4 flex items-center justify-center space-x-3 hover:bg-gray-700 transition-colors"
          >
            <Gift className="w-5 h-5 text-green-500 fill-current" />
            <span className="text-white font-medium">Premios</span>
          </button>

        </div>
      </div>

      {/* Latest Sorteos Section */}
      {otherRaffles.length > 0 && (
        <div className="bg-[#1a1f27] p-4 pb-8">
          <div className="max-w-md mx-auto">
            <h3 className="text-white text-lg font-bold mb-4 text-center">
              Echa un vistazo a nuestros últimos sorteos
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {otherRaffles.slice(0, 2).map((otherRaffle, index) => (
                <div key={otherRaffle._id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="relative h-24">
                    <Image
                      src={otherRaffle.image || "/placeholder.svg"}
                      alt={otherRaffle.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.log('Error cargando imagen:', otherRaffle.image);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-white font-bold text-sm mb-1 truncate">{otherRaffle.title}</div>
                    <div className="text-white text-xs mb-1 truncate">{otherRaffle.description}</div>
                    <div className="text-white text-xs mb-2">
                      ${otherRaffle.ticketPrice?.toLocaleString() || 'N/A'} 1ER LUGAR
                    </div>
                    <div className="space-y-2">
                      <div className="bg-green-500 rounded px-2 py-1 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-white" />
                        <span className="text-white text-xs">
                          {new Date(otherRaffle.drawDate).toLocaleDateString("es-VE", { 
                            month: "long", 
                            year: "numeric" 
                          })}
                        </span>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowTicketVerifier(true)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded text-center transition-colors"
                        >
                          Verificar
                        </button>
                        <Link
                          href={`/raffle/${otherRaffle._id}`}
                          className="flex-1 text-white text-xs py-1 px-2 rounded text-center transition-colors border border-transparent"
                          style={{ backgroundColor: '#16DB65' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#14C85A'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16DB65'}
                        >
                          Comprar
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Prizes Modal */}
      <PrizesModal
        isOpen={showPrizesModal}
        onClose={() => setShowPrizesModal(false)}
        onGetCompletedRaffles={handleGetCompletedRaffles}
      />
    </div>
  )
}
