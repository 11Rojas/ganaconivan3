import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { idType, idNumber } = body

    // Validaciones básicas
    if (!idType || !idNumber) {
      return NextResponse.json(
        { error: "Tipo de cédula y número son requeridos" },
        { status: 400 }
      )
    }

    if (idNumber.length < 6 || idNumber.length > 8) {
      return NextResponse.json(
        { error: "Número de cédula inválido" },
        { status: 400 }
      )
    }

    // Buscar compras por cédula y poblar la información de la rifa
    const purchases = await (Purchase as any).find({
      'paymentData.idType': idType,
      'paymentData.idNumber': idNumber
    }).populate('raffleId', 'title')

    // Formatear los resultados
    const tickets = purchases.map(purchase => ({
      id: purchase._id,
      raffleTitle: purchase.raffleId?.title || 'Rifa no encontrada',
      amount: purchase.totalAmount,
      quantity: purchase.numbers?.length || 0,
      assignedNumbers: purchase.numbers || [],
      status: purchase.status,
      createdAt: purchase.createdAt,
      paymentMethod: purchase.paymentMethod,
      reference: purchase.paymentData?.reference
    }))

    return NextResponse.json({
      success: true,
      tickets,
      total: tickets.length
    })

  } catch (error) {
    console.error('Error verificando tickets:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}