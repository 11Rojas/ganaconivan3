# Configuración de Openinary - Sistema de Imágenes

## 📋 Resumen

Este proyecto usa **Openinary** para almacenar y servir imágenes, con un **proxy local** para resolver problemas de CORS y acceso directo a la IP del servidor.

## 🔧 Servidor Openinary

- **URL**: `http://158.69.213.106:3000`
- **API Key**: `mUqzktBdIHOKjfFTFnAdmLDeZNSdcpsgbSRRaHfGzvPbtfxziEnLqTspbBwSNgTN`

## 🚀 Flujo de Imágenes

### 1. Subida de Imágenes

Cuando se crea o actualiza una rifa, o se sube un comprobante:

```typescript
// En app/api/raffles/route.ts
const imageUrl = await uploadToOpeninary(imageFile, "rifas", imageFile.name)
// Retorna: http://158.69.213.106:3000/t/rifas/nombre-imagen.jpg
```

### 2. Almacenamiento en Base de Datos

La URL completa se guarda en MongoDB:

```json
{
  "_id": "...",
  "title": "Rifa 1",
  "image": "http://158.69.213.106:3000/t/rifas/imagen.jpg",
  ...
}
```

### 3. Renderizado en el Frontend

Cuando se muestra la imagen, se usa `getImageUrl()`:

```typescript
// En components/FeaturedRaffles.tsx
<Image 
  src={getImageUrl(raffle.image, "/placeholder.svg")}
  alt={raffle.title}
/>
```

### 4. Conversión Automática al Proxy

`getImageUrl()` detecta que es una URL de Openinary y la convierte:

**Entrada**: `http://158.69.213.106:3000/t/rifas/imagen.jpg`

**Salida**: `/api/image-proxy?url=http%3A%2F%2F158.69.213.106%3A3000%2Ft%2Frifas%2Fimagen.jpg`

### 5. Proxy Sirve la Imagen

El navegador solicita la imagen a `/api/image-proxy`, que:
1. Valida que la URL sea del servidor Openinary
2. Descarga la imagen desde `http://158.69.213.106:3000`
3. La cachea por 1 hora
4. La sirve al navegador con headers CORS correctos

## 📁 Archivos Modificados

### APIs que suben imágenes:
- ✅ `app/api/raffles/route.ts` - Crear rifas
- ✅ `app/api/raffles/[id]/route.ts` - Actualizar rifas
- ✅ `app/api/purchases/route.ts` - Subir comprobantes

### Proxy de imágenes:
- ✅ `app/api/image-proxy/route.ts` - Proxy que sirve las imágenes

### Utilidad de imágenes:
- ✅ `lib/imageUtils.ts` - Función `getImageUrl()` que convierte URLs al proxy
- ✅ `lib/openinary.ts` - Cliente para subir archivos a Openinary

### Componentes que muestran imágenes:
- ✅ `components/FeaturedRaffles.tsx`
- ✅ `components/LatestDraws.tsx`
- ✅ `components/TicketVerifier.tsx`
- ✅ `components/MobileHero.tsx`
- ✅ `components/PrizesModal.tsx`
- ✅ `components/admin/RaffleManagement.tsx`
- ✅ `app/raffle/[id]/page.tsx`

## 🔍 Verificación

Para verificar que el proxy funciona:

1. **Subir una imagen**: Ve al panel de admin y crea una rifa con imagen
2. **Ver en la base de datos**: La URL debe ser `http://158.69.213.106:3000/t/rifas/...`
3. **Inspeccionar en el navegador**: 
   - Abre DevTools → Network
   - La imagen debe cargarse desde `/api/image-proxy?url=...`
   - Status: 200 OK
4. **Ver en la página**: La imagen debe mostrarse correctamente

## ⚠️ Problemas Comunes

### La imagen no se muestra

1. **Verificar la URL en la base de datos**:
   ```bash
   # Debe ser: http://158.69.213.106:3000/t/carpeta/archivo.jpg
   ```

2. **Verificar el proxy**:
   - Abrir: `http://localhost:3000/api/image-proxy?url=http://158.69.213.106:3000/t/rifas/test.jpg`
   - Debe mostrar la imagen o un error específico

3. **Ver logs del servidor**:
   ```bash
   bun dev
   # Buscar errores de "image-proxy" o "Openinary"
   ```

### Error 403 (No autorizado)

El proxy solo acepta URLs de:
- `158.69.213.106` (Servidor Openinary)
- `localhost`
- `127.0.0.1`

Si recibes 403, verifica que la URL sea del servidor correcto.

### Error 500 al subir imagen

Verifica:
1. Que el servidor Openinary esté activo
2. Que el API key sea correcto
3. Que el archivo no sea muy grande (límite del servidor)

## 🛠️ Mantenimiento

### Cambiar servidor Openinary

Si cambias la IP o puerto del servidor:

1. Actualizar en `lib/openinary.ts`:
   ```typescript
   const OPENINARY_URL = 'http://NUEVA-IP:PUERTO'
   ```

2. Actualizar en `app/api/image-proxy/route.ts`:
   ```typescript
   const allowedHosts = [
     'NUEVA-IP',
     ...
   ]
   ```

3. Actualizar en `lib/imageUtils.ts`:
   ```typescript
   if (imageUrl.includes('NUEVA-IP') || imageUrl.includes('/t/')) {
     ...
   }
   ```

### Aumentar tiempo de caché

En `app/api/image-proxy/route.ts`:

```typescript
headers: {
  'Cache-Control': 'public, max-age=86400, ...',  // 24 horas
}
```

## ✅ Estado Actual

- ✅ Openinary configurado y funcionando
- ✅ Proxy de imágenes activo
- ✅ Todos los componentes usando el proxy
- ✅ CORS resuelto
- ✅ Caché implementado
- ❌ Cloudinary eliminado (puedes remover el paquete)

## 📝 Próximos Pasos Opcionales

1. Eliminar el paquete de Cloudinary:
   ```bash
   bun remove cloudinary
   ```

2. Eliminar archivo obsoleto:
   ```bash
   rm lib/cloudinary.ts
   ```

3. Agregar variable de entorno (opcional):
   ```env
   OPENINARY_URL=http://158.69.213.106:3000
   OPENINARY_API_KEY=mUqzktBdIHOKjfFTFnAdmLDeZNSdcpsgbSRRaHfGzvPbtfxziEnLqTspbBwSNgTN
   ```
