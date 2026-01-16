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

  // Si es una ruta relativa local (placeholder, logos, etc), devolverla tal cual
  if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
    // Excepto si es del servidor de Openinary (empezará con /t/)
    if (!imageUrl.startsWith('/t/')) {
      return imageUrl;
    }
  }

  // Si es una URL de Openinary (contiene la IP del servidor o /t/), usar el proxy
  // Las URLs de Openinary vienen como: http://158.69.213.106:3000/t/path.jpg
  if (imageUrl.includes('158.69.213.106') || imageUrl.includes('/t/')) {
    // Si la URL ya es completa, usarla directamente
    let normalizedUrl = imageUrl;
    if (imageUrl.startsWith('/t/')) {
      // Es una URL relativa de Openinary, construir la URL completa
      const openinaryUrl = process.env.NEXT_PUBLIC_OPENINARY_URL || 'http://158.69.213.106:3000';
      normalizedUrl = `${openinaryUrl}${imageUrl}`;
    }
    
    return `/api/image-proxy?url=${encodeURIComponent(normalizedUrl)}`;
  }

  // Si es una URL externa (Cloudinary, etc), usar el proxy
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
