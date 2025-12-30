import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { PaymentConfig } from "@/models/PaymentConfig"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await connectDB()

    const config = await (PaymentConfig as any).getConfig()

    return NextResponse.json({
      cedula: config.cedula,
      phone: config.phone,
      bank: config.bank,
    })
  } catch (error) {
    console.error("Error fetching payment config:", error)
    return NextResponse.json(
      { error: "Error al obtener la configuración de pago" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    await connectDB()

    const body = await request.json()
    const { cedula, phone, bank } = body

    if (!cedula || !phone || !bank) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    let config = await (PaymentConfig as any).findOne()
    
    if (config) {
      config.cedula = cedula
      config.phone = phone
      config.bank = bank
      await config.save()
    } else {
      config = await (PaymentConfig as any).create({
        cedula,
        phone,
        bank,
      })
    }

    return NextResponse.json({
      message: "Configuración actualizada correctamente",
      config: {
        cedula: config.cedula,
        phone: config.phone,
        bank: config.bank,
      },
    })
  } catch (error) {
    console.error("Error updating payment config:", error)
    return NextResponse.json(
      { error: "Error al actualizar la configuración de pago" },
      { status: 500 }
    )
  }
}

