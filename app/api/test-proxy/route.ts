import { NextResponse } from 'next/server'

/**
 * Endpoint de prueba para verificar que el proxy de imágenes funciona
 * Uso: GET /api/test-proxy
 */
export async function GET() {
  const testUrl = 'http://158.69.213.106:3000/t/test.jpg'
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(testUrl)}`
  
  return NextResponse.json({
    message: 'Configuración del proxy de imágenes',
    openinaryServer: 'http://158.69.213.106:3000',
    testImageUrl: testUrl,
    proxyUrl: proxyUrl,
    fullProxyUrl: `http://localhost:3000${proxyUrl}`,
    instructions: [
      '1. Sube una imagen desde el panel de admin',
      '2. La URL en la base de datos debe ser: http://158.69.213.106:3000/t/carpeta/archivo.jpg',
      '3. En el HTML del navegador debe aparecer: /api/image-proxy?url=...',
      '4. Abre DevTools → Network → Busca "image-proxy" para ver las solicitudes',
      '5. Las imágenes deben cargar con status 200'
    ],
    status: 'OK'
  })
}
