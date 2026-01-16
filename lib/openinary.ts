// Configuración de Openinary para subir imágenes
// Openinary es una alternativa self-hosted a Cloudinary

const OPENINARY_URL = process.env.OPENINARY_URL || process.env.NEXT_PUBLIC_OPENINARY_URL
const OPENINARY_API_KEY = process.env.OPENINARY_API_KEY

if (!OPENINARY_URL) {
  console.warn('OPENINARY_URL no está configurado en las variables de entorno')
}

if (!OPENINARY_API_KEY) {
  console.warn('OPENINARY_API_KEY no está configurado en las variables de entorno')
}

export interface UploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
  format?: string
}

/**
 * Sube un archivo a Openinary
 * @param buffer - Buffer del archivo a subir
 * @param options - Opciones de subida (folder, nombre del archivo, etc.)
 */
export async function uploadToOpeninary(
  buffer: Buffer,
  options: {
    folder?: string
    filename?: string
    resourceType?: 'image' | 'video' | 'raw' | 'auto'
  } = {}
): Promise<UploadResult> {
  try {
    if (!OPENINARY_URL || !OPENINARY_API_KEY) {
      throw new Error('Openinary no está configurado correctamente')
    }

    const formData = new FormData()
    
    // Crear un blob del buffer
    const uint8Array = new Uint8Array(buffer)
    const blob = new Blob([uint8Array])
    const filename = options.filename || `upload-${Date.now()}.jpg`
    formData.append('file', blob, filename)
    
    // Agregar metadata
    if (options.folder) {
      formData.append('folder', options.folder)
    }
    
    // Subir a Openinary
    const uploadUrl = `${OPENINARY_URL}/api/upload`
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENINARY_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al subir a Openinary: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    // Retornar la URL de la imagen subida
    // La URL directa de Openinary puede no funcionar en el navegador,
    // por lo que usaremos nuestro proxy
    return {
      url: result.url || result.secure_url || result.path,
      publicId: result.public_id || result.id || filename,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('Error en uploadToOpeninary:', error)
    throw error
  }
}

/**
 * Elimina un archivo de Openinary
 * @param publicId - ID público del archivo a eliminar
 */
export async function deleteFromOpeninary(publicId: string): Promise<boolean> {
  try {
    if (!OPENINARY_URL || !OPENINARY_API_KEY) {
      console.warn('Openinary no está configurado, no se puede eliminar')
      return false
    }

    const deleteUrl = `${OPENINARY_URL}/api/delete/${encodeURIComponent(publicId)}`
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${OPENINARY_API_KEY}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Error al eliminar de Openinary:', error)
    return false
  }
}

/**
 * Obtiene la URL del proxy para una imagen de Openinary
 * Esto evita problemas de CORS y IPs bloqueadas
 */
export function getProxiedImageUrl(imageUrl: string): string {
  if (!imageUrl) return ''
  
  // Si la URL ya es del proxy, no hacer nada
  if (imageUrl.startsWith('/api/image-proxy')) {
    return imageUrl
  }
  
  // Si es una URL externa de Openinary, usar el proxy
  if (imageUrl.includes('openinary') || imageUrl.startsWith('http')) {
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
  }
  
  // Si es una URL relativa o local, devolver tal cual
  return imageUrl
}

export default {
  upload: uploadToOpeninary,
  delete: deleteFromOpeninary,
  getProxiedUrl: getProxiedImageUrl,
}
