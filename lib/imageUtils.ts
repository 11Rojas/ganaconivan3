export function getImageUrl(imageUrl: string | undefined, fallback: string = "/placeholder.jpg"): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return fallback;
  }

  // Si ya es una URL completa, devolverla
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si es una ruta relativa, agregar el dominio base si es necesario
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Si es una URL de Cloudinary sin protocolo, agregar https
  if (imageUrl.includes('cloudinary.com')) {
    return `https://${imageUrl}`;
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
