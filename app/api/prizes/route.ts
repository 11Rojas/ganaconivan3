import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Raffle from "@/models/Raffle"
import { Purchase } from "@/models/Purchase"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Buscar rifas que han terminado (endDate < fecha actual)
    const now = new Date()
    const completedRaffles = await (Raffle as any).find({
      endDate: { $lt: now },
      status: { $in: ['completed', 'finished'] }
    })
    .sort({ endDate: -1 }) // Más recientes primero
    .limit(20) // Limitar a 20 rifas

    // Para cada rifa completada, buscar los ganadores
    const rafflesWithWinners = await Promise.all(
      completedRaffles.map(async (raffle) => {
        // Buscar compras aprobadas para esta rifa
        const purchases = await (Purchase as any).find({
          raffleId: raffle._id,
          status: 'approved'
        })

        // Simular ganadores basado en números aleatorios
        // En un sistema real, esto vendría de un sorteo real
        const winners = []
        
        if (purchases.length > 0) {
          // Seleccionar ganadores aleatoriamente
          const numWinners = Math.min(3, purchases.length) // Máximo 3 ganadores
          const shuffledPurchases = purchases.sort(() => 0.5 - Math.random())
          
          for (let i = 0; i < numWinners; i++) {
            const purchase = shuffledPurchases[i]
            const prizeAmount = calculatePrizeAmount(i + 1, raffle.totalAmount || 0)
            
            winners.push({
              _id: purchase._id,
              name: purchase.paymentData?.name || 'Ganador Anónimo',
              phone: purchase.paymentData?.phone || '',
              email: purchase.paymentData?.email || '',
              ticketNumber: purchase.assignedNumbers?.[0] || purchase.numbers?.[0] || 'N/A',
              prizeAmount,
              prizePosition: i + 1,
              image: null // Se puede agregar imagen del ganador más tarde
            })
          }
        }

        return {
          _id: raffle._id,
          title: raffle.title,
          description: raffle.description,
          endDate: raffle.endDate,
          winners,
          totalTickets: raffle.totalNumbers || 0,
          ticketPrice: raffle.ticketPrice,
          image: raffle.image
        }
      })
    )

    // Filtrar solo rifas que tienen ganadores
    const rafflesWithWinnersOnly = rafflesWithWinners.filter(raffle => raffle.winners.length > 0)

    return NextResponse.json({
      success: true,
      raffles: rafflesWithWinnersOnly
    })

  } catch (error) {
    console.error('Error obteniendo premios:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Función para calcular el monto del premio basado en la posición
function calculatePrizeAmount(position: number, totalAmount: number): number {
  switch (position) {
    case 1: // Primer lugar
      return Math.floor(totalAmount * 0.5) // 50% del total
    case 2: // Segundo lugar
      return Math.floor(totalAmount * 0.25) // 25% del total
    case 3: // Tercer lugar
      return Math.floor(totalAmount * 0.15) // 15% del total
    default:
      return Math.floor(totalAmount * 0.1) // 10% del total
  }
}
