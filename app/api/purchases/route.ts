import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Purchase } from "@/models/Purchase"
import Raffle from "@/models/Raffle"
import { requireAuth } from "@/lib/auth"
import { v2 as cloudinary } from 'cloudinary'

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const raffleId = formData.get("raffleId")?.toString()
    const raffleTitle = formData.get("raffleTitle")?.toString()
    const quantity = parseInt(formData.get("quantity")?.toString() || "0")
    const paymentMethod = formData.get("paymentMethod")?.toString()
    const reference = formData.get("reference")?.toString()
    const assignedNumbersStr = formData.get("assignedNumbers")?.toString()
    const paymentData = JSON.parse(formData.get("paymentData")?.toString() || "{}")
    const receiptFile = formData.get("receipt") as File | null

    // Validaciones básicas - hacer más flexible
    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Método de pago requerido" },
        { status: 400 }
      )
    }

    // Validar paymentMethod
    const validPaymentMethods = ["zelle", "venezolano-credito", "mercado-pago"]
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Método de pago no válido" },
        { status: 400 }
      )
    }

    // Si no hay raffleId, buscar rifa activa por título
    let raffle = null
    if (raffleId) {
      raffle = await (Raffle as any).findById(raffleId)
    } else if (raffleTitle) {
      raffle = await (Raffle as any).findOne({ 
        title: raffleTitle, 
        status: "active" 
      })
    }

    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa no disponible" },
        { status: 400 }
      )
    }

    // Validar ticketPrice
    const ticketPrice = parseFloat(raffle.ticketPrice?.toString() || "0")
    if (isNaN(ticketPrice) || ticketPrice <= 0) {
      return NextResponse.json(
        { error: "Precio del ticket no válido" },
        { status: 400 }
      )
    }

    // Validar mínimo de tickets
    const minTickets = raffle.minTickets || 1
    if (quantity < minTickets) {
      return NextResponse.json(
        { error: `Debes comprar al menos ${minTickets} ticket${minTickets > 1 ? 's' : ''}` },
        { status: 400 }
      )
    }

    // Usar números asignados del frontend o generar nuevos
    let assignedNumbers: string[] = []
    
    if (assignedNumbersStr) {
      // Usar números que vienen del frontend
      try {
        assignedNumbers = JSON.parse(assignedNumbersStr)
        console.log('Usando números del frontend:', assignedNumbers)
      } catch (error) {
        console.error('Error parsing assignedNumbers:', error)
        return NextResponse.json(
          { error: "Error al procesar los números asignados" },
          { status: 400 }
        )
      }
    } else {
      // Generar números si no vienen del frontend (fallback)
      console.log('Generando números en el backend como fallback')
      
      // Si hay totalNumbers definido, usar lógica de números limitados
      const totalNumbers = raffle.totalNumbers || 0
      if (totalNumbers > 0) {
        const soldNumbers = raffle.soldNumbers || []
        const availableNumbersCount = totalNumbers - soldNumbers.length
        
        if (availableNumbersCount < quantity) {
          return NextResponse.json(
            { error: `No hay suficientes números disponibles. Solo quedan ${availableNumbersCount} números` }, 
            { status: 400 }
          )
        }

        // Generar todos los números posibles con formato 0001
        const allNumbers = Array.from({ length: totalNumbers }, (_, i) => 
          (i + 1).toString().padStart(4, '0')
        )
        
        // Filtrar números disponibles
        const availableNumbers = allNumbers.filter(num => !soldNumbers.includes(num))
        
        // Asignar números aleatorios
        assignedNumbers = [...availableNumbers]
          .sort(() => 0.5 - Math.random())
          .slice(0, quantity)
          .sort((a, b) => parseInt(a) - parseInt(b)) // Ordenar numéricamente
      } else {
        // Si no hay totalNumbers, generar números aleatorios de 4 dígitos
        const usedNumbers = new Set<string>()
        
        while (assignedNumbers.length < quantity) {
          const randomNum = Math.floor(Math.random() * 9000) + 1000
          const numStr = randomNum.toString()
          
          if (!usedNumbers.has(numStr)) {
            usedNumbers.add(numStr)
            assignedNumbers.push(numStr)
          }
        }
        
        assignedNumbers.sort((a, b) => parseInt(a) - parseInt(b))
      }
    }

    // Subir comprobante a Cloudinary (opcional)
    let receiptUrl = ""
    if (receiptFile) {
      try {
        const arrayBuffer = await receiptFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: "receipts",
              resource_type: "auto",
              allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          ).end(buffer)
        })

        receiptUrl = (result as any)?.secure_url || ""
      } catch (error) {
        console.error('Error subiendo comprobante:', error)
        // Continuar sin comprobante si hay error
      }
    }

    // Calcular monto total
    const totalAmount = quantity * ticketPrice

    // Crear la compra
    const purchase = new Purchase({
      raffleId: raffle._id,
      numbers: assignedNumbers.map(num => parseInt(num)), // Convertir strings a números
      totalAmount,
      paymentMethod,
      paymentData: {
        ...paymentData,
        reference: reference || paymentData.reference || '',
        receipt: receiptUrl,
      },
      status: "pending",
    })

    await purchase.save()

    // Actualizar números vendidos (solo si hay totalNumbers definido)
    const totalNumbers = raffle.totalNumbers || 0
    if (totalNumbers > 0) {
      await (Raffle as any).findByIdAndUpdate(raffle._id, {
        $addToSet: { soldNumbers: { $each: assignedNumbers } },
      })
    }


    return NextResponse.json({
      ...purchase.toObject(),
      numbers: assignedNumbers, // Devolver los números como strings para el frontend
      message: `Números asignados: ${assignedNumbers.join(", ")}`
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating purchase:", error)
    return NextResponse.json(
      { error: "Error al procesar la compra", details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const query: any = {}

    if (session.user.role !== "admin") {
      query.userId = session.user.id
    }

    if (status) query.status = status

    const purchases = await (Purchase as any).find(query)
      .populate("raffleId", "title image drawDate")
      .sort({ createdAt: -1 })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ error: "Error al obtener las compras" }, { status: 500 })
  }
}