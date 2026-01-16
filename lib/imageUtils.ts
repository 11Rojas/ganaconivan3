/**
 * Obtiene la URL de una imagen usando el proxy si es necesario
 * Esto permite cargar imágenes de Openinary que tienen problemas de IP/CORS
 */
export function getImageUrl(imageUrl: string | undefined, fallback: string = "/placeholder.jpg"): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return fallback;
  }

  // Si ya es una URL del proxy, devolverla
  if (imageUrl.startsWith('/api/image-proxy')) {
    return imageUrl;
  }

  // Si es una ruta relativa local, devolverla tal cual
  if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
    return imageUrl;
  }

  // Si es una URL externa (Openinary, Cloudinary, etc), usar el proxy
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('//')) {
    // Normalizar URLs que empiezan con //
    let normalizedUrl = imageUrl;
    if (imageUrl.startsWith('//')) {
      normalizedUrl = `https:${imageUrl}`;
    }
    
    // Usar el proxy para evitar problemas de CORS/IP
    return `/api/image-proxy?url=${encodeURIComponent(normalizedUrl)}`;
  }

  // Si es una URL de Cloudinary sin protocolo, agregar https y usar proxy
  if (imageUrl.includes('cloudinary.com')) {
    const normalizedUrl = `https://${imageUrl}`;
    return `/api/image-proxy?url=${encodeURIComponent(normalizedUrl)}`;
  }

  // Por defecto, devolver la imagen tal como está
  return imageUrl;
}

export function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;
  
  // Verificar si es una URL válida
  try {
    new URL(url);
    return true;
  } catch {
    // Si no es una URL válida, verificar si es una ruta relativa válida
    return url.startsWith('/') && url.length > 1;
  }
}
