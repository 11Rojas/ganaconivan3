import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Raffle from "@/models/Raffle"
import { requireAdmin } from "@/lib/auth"
import { uploadToOpeninary } from "@/lib/openinary"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    
    const raffle = await Raffle.findById(id)
    
    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(raffle)
  } catch (error) {
    console.error("Error fetching raffle:", error)
    return NextResponse.json(
      { error: "Error al obtener la rifa" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const { id } = await params
    
    const raffle = await Raffle.findById(id)
    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const ticketPrice = parseFloat(formData.get("ticketPrice") as string)
    const totalNumbers = parseInt(formData.get("totalNumbers") as string)
    const minTickets = parseInt(formData.get("minTickets") as string) || 1
    const drawDate = formData.get("drawDate") as string
    const imageFile = formData.get("image") as File | null
    const currentImage = formData.get("currentImage") as string

    let imageUrl = currentImage || ""

    // Subir nueva imagen a Openinary si existe
    if (imageFile) {
      try {
        imageUrl = await uploadToOpeninary(imageFile, "rifas", imageFile.name)
      } catch (error) {
        console.error("Openinary upload error:", error)
        throw new Error("Error al subir la imagen")
      }
    }

    // Actualizar la rifa
    const updatedRaffle = await Raffle.findByIdAndUpdate(
      id,
      {
        title,
        description,
        ticketPrice,
        totalNumbers,
        minTickets,
        drawDate: new Date(drawDate),
        image: imageUrl,
        updatedAt: new Date()
      },
      { new: true }
    )

    return NextResponse.json(updatedRaffle)
  } catch (error) {
    console.error("Error updating raffle:", error)
    return NextResponse.json(
      { error: "Error al actualizar la rifa" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const { id } = await params
    
    const raffle = await Raffle.findById(id)
    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      )
    }

    // Nota: Openinary no tiene endpoint de eliminación en este momento
    // Las imágenes antiguas se mantienen en el servidor

    // Eliminar la rifa
    await Raffle.findByIdAndDelete(id)

    return NextResponse.json({ message: "Rifa eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting raffle:", error)
    return NextResponse.json(
      { error: "Error al eliminar la rifa" },
      { status: 500 }
    )
  }
}