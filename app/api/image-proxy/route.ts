import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy para servir imágenes de Openinary
 * 
 * Este endpoint actúa como proxy para las imágenes de Openinary,
 * evitando problemas de CORS y IPs bloqueadas en el navegador.
 * 
 * Uso: /api/image-proxy?url=https://openinary-server.com/image.jpg
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de imagen no proporcionada' },
        { status: 400 }
      )
    }

    // Validar que la URL sea válida
    let url: URL
    try {
      url = new URL(imageUrl)
    } catch {
      return NextResponse.json(
        { error: 'URL de imagen inválida' },
        { status: 400 }
      )
    }

    // Por seguridad, validar que la URL sea de fuentes permitidas
    const allowedHosts = [
      '158.69.213.106',  // IP del servidor Openinary
      'localhost',
      '127.0.0.1',
      'res.cloudinary.com',  // Por compatibilidad
    ]
    
    const isAllowed = allowedHosts.some(host => url.hostname.includes(host))
    
    if (!isAllowed) {
      console.warn('URL no autorizada:', url.hostname)
      return NextResponse.json(
        { error: 'URL no autorizada. Solo se permiten imágenes del servidor Openinary.' },
        { status: 403 }
      )
    }

    // Obtener la imagen desde Openinary
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-ImageProxy/1.0)',
      },
      // Cachear por 1 hora
      next: { revalidate: 3600 }
    })

    if (!imageResponse.ok) {
      console.error('Error al obtener imagen de Openinary:', imageResponse.status)
      return NextResponse.json(
        { error: 'Error al obtener la imagen' },
        { status: imageResponse.status }
      )
    }

    // Obtener el contenido de la imagen
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Obtener el tipo de contenido
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    
    // Crear la respuesta con la imagen
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error en image-proxy:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

// Manejar OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
