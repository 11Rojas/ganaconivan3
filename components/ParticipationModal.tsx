"use client"

import { useState, useEffect, useRef } from "react"
import type { Raffle } from "@/lib/types"
import FullScreenModal from "./FullScreenModal"
import PersonalDataForm from "./PersonalDataForm"
import PaymentScreen from "./PaymentScreen"
import ReceiptCaptureScreen from "./ReceiptCaptureScreen"
import SuccessModal from "./SuccessModal"

interface PersonalData {
  fullName: string
  idType: string
  idNumber: string
  phone: string
  email: string
}

interface ParticipationModalProps {
  raffle: Raffle
  quantity: number
  exchangeRate: number
  isOpen: boolean
  onClose: () => void
}

export default function ParticipationModal({ 
  raffle, 
  quantity, 
  exchangeRate, 
  isOpen, 
  onClose
}: ParticipationModalProps) {
  
  const ticketPriceInBs = raffle.ticketPrice
  const totalPrice = ticketPriceInBs * quantity

  // ESTADO SIMPLE DEL PASO ACTUAL
  const [currentStep, setCurrentStep] = useState(1)
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)
  const [generatedTicketNumbers, setGeneratedTicketNumbers] = useState<string[]>([])
  const [receiptData, setReceiptData] = useState<{ reference: string; receipt: File | null } | null>(null)
  const [isClient, setIsClient] = useState(false)
  const stepRef = useRef(1)

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true)
    
    // Leer y restaurar paso desde localStorage cuando se abre el modal
    if (isOpen && typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('participationStep')
      console.log('🔍 Efecto montaje/isOpen - savedStep:', savedStep)
      if (savedStep && parseInt(savedStep) > 1) {
        console.log('✅ Restaurando desde localStorage al paso:', savedStep)
        const step = parseInt(savedStep)
        setCurrentStep(step)
        stepRef.current = step
        
        // Si estamos en paso 4, también necesitamos restaurar personalData y generar números
        if (step === 4) {
          const savedPersonalData = localStorage.getItem('personalData')
          if (savedPersonalData) {
            try {
              const parsed = JSON.parse(savedPersonalData)
              console.log('📋 Restaurando personalData:', parsed)
              setPersonalData(parsed)
            } catch (e) {
              console.error('Error parseando personalData:', e)
            }
          }
          // Generar números de ticket si no existen
          if (generatedTicketNumbers.length === 0) {
            const numbers = generateTicketNumbers(quantity)
            console.log('🎟️ Generando números de ticket:', numbers)
            setGeneratedTicketNumbers(numbers)
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Sincronizar ref con state
  useEffect(() => {
    stepRef.current = currentStep
  }, [currentStep])

  const generateTicketNumbers = (quantity: number): string[] => {
    const numbers: string[] = []
    for (let i = 0; i < quantity; i++) {
      const number = Math.floor(Math.random() * 9000) + 1000
      numbers.push(number.toString())
    }
    return numbers
  }


  const handleStep1Continue = () => {
    setCurrentStep(2)
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('participationStep', '2')
    }
  }

  const handleStep2Submit = (data: PersonalData) => {
    setPersonalData(data)
    setCurrentStep(3)
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('participationStep', '3')
    }
  }

  const handleStep2Back = () => {
    setCurrentStep(1)
    // Limpiar localStorage al volver al paso 1
    if (typeof window !== 'undefined') {
      localStorage.removeItem('participationStep')
    }
  }

  const handleStep3Back = () => {
    setCurrentStep(2)
    // Actualizar localStorage al volver al paso 2
    if (typeof window !== 'undefined') {
      localStorage.setItem('participationStep', '2')
    }
  }

  const handleReportPayment = () => {
    console.log('🎯 === HANDLE REPORT PAYMENT ===')
    console.log('ANTES - currentStep:', currentStep, 'stepRef.current:', stepRef.current)
    const numbers = generateTicketNumbers(quantity)
    setGeneratedTicketNumbers(numbers)
    
    // Cambiar el paso primero
    setCurrentStep(4)
    stepRef.current = 4
    
    // Luego guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('participationStep', '4')
      console.log('💾 Guardado en localStorage: 4')
    }
    
    console.log('✅ DESPUÉS - setCurrentStep(4) ejecutado')
    console.log('=== FIN HANDLE REPORT PAYMENT ===')
  }

  const handleReceiptCaptureBack = () => {
    setCurrentStep(3)
    // Actualizar localStorage al volver al paso 3
    if (typeof window !== 'undefined') {
      localStorage.setItem('participationStep', '3')
    }
  }

  const handleReceiptSubmit = async (receiptData: { reference: string; receipt: File | null }) => {
    setReceiptData(receiptData)
    
    try {
      const formData = new FormData()
      formData.append('raffleTitle', raffle.title)
      formData.append('amount', totalPrice.toString())
      formData.append('quantity', quantity.toString())
      formData.append('paymentMethod', 'venezolano-credito')
      formData.append('reference', receiptData.reference)
      formData.append('assignedNumbers', JSON.stringify(generatedTicketNumbers))
      
      if (personalData) {
        formData.append('paymentData', JSON.stringify({
          name: personalData.fullName,
          email: personalData.email,
          phone: personalData.phone,
          idType: personalData.idType,
          idNumber: personalData.idNumber,
          reference: receiptData.reference,
          bank: "Banco de Venezuela",
          bankPhone: "04249327805",
          bankCedula: "26943027"
        }))
      }
      
      if (receiptData.receipt) {
        formData.append('receipt', receiptData.receipt)
      }
      
      formData.append('timestamp', new Date().toISOString())

      const response = await fetch('/api/purchases', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar la compra')
      }

      const result = await response.json()
      console.log('Compra procesada exitosamente:', result)
      
      setCurrentStep(5)
      // Guardar paso 5 en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('participationStep', '5')
      }
      
    } catch (error) {
      console.error('Error al procesar compra:', error)
      alert(`Error al procesar la compra: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setPersonalData(null)
    setGeneratedTicketNumbers([])
    setReceiptData(null)
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('participationStep')
    }
    
    onClose()
  }

  const handleSuccessClose = () => {
    setCurrentStep(1)
  }

  const handleSuccessComplete = () => {
    handleClose()
  }

  if (!isOpen) return null

  console.log('RENDERIZANDO - currentStep:', currentStep, 'isClient:', isClient)

  return (
    <>
      {currentStep === 1 && (
        <>
          {console.log('RENDERIZANDO PASO 1 - FullScreenModal')}
          <FullScreenModal
            raffle={raffle}
            quantity={quantity}
            exchangeRate={exchangeRate}
            isOpen={true}
            onClose={handleClose}
            onContinue={handleStep1Continue}
          />
        </>
      )}

      {currentStep === 2 && (
        <PersonalDataForm
          isOpen={true}
          onClose={handleClose}
          onBack={handleStep2Back}
          onPay={handleStep2Submit}
        />
      )}

      {currentStep === 3 && (
        <PaymentScreen
          isOpen={true}
          onClose={handleClose}
          onReportPayment={handleReportPayment}
          totalAmount={totalPrice}
          raffleTitle={raffle.title}
          personalData={personalData}
        />
      )}

      {currentStep === 4 && (
        <>
          {console.log('RENDERIZANDO PASO 4 - ReceiptCaptureScreen')}
          <ReceiptCaptureScreen
            isOpen={true}
            onClose={handleClose}
            onBack={handleReceiptCaptureBack}
            onSubmit={handleReceiptSubmit}
            totalAmount={totalPrice}
            raffleTitle={raffle.title}
            personalData={personalData}
          />
        </>
      )}

      {currentStep === 5 && (
        <SuccessModal
          isOpen={true}
          onClose={handleSuccessClose}
          onComplete={handleSuccessComplete}
          ticketNumbers={generatedTicketNumbers}
          raffleTitle={raffle.title}
        />
      )}
    </>
  )
}