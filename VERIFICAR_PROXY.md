# ✅ Verificación del Proxy de Imágenes

## 🎯 Objetivo

**TODAS las imágenes de Openinary deben cargarse a través del proxy local `/api/image-proxy`**

El navegador NUNCA debe ver directamente: `http://158.69.213.106:3000`

## 🔍 Cómo Verificar

### 1. Página de Test

Visita: **http://localhost:3000/test-images**

Esta página muestra:
- ✅ Conversión automática de URLs
- ✅ Ejemplos de diferentes tipos de URLs
- ✅ Verificación de que el proxy funciona

### 2. Inspeccionar en el Navegador

1. **Abre la página principal** → http://localhost:3000
2. **Abre DevTools** → F12 o Click derecho → Inspeccionar
3. **Ve a la pestaña Network**
4. **Filtra por "image-proxy"**
5. **Recarga la página** → Ctrl+R

**Deberías ver:**
```
✅ /api/image-proxy?url=http%3A%2F%2F158.69.213.106%3A3000%2Ft%2Frifas%2Fimagen.jpg
✅ Status: 200
✅ Type: image/jpeg
```

**NO deberías ver:**
```
❌ http://158.69.213.106:3000/t/rifas/imagen.jpg (directo)
```

### 3. Inspeccionar el HTML

1. **Click derecho en una imagen** → Inspeccionar elemento
2. **Busca el atributo `src`**

**Debe ser:**
```html
<img src="/api/image-proxy?url=http%3A%2F%2F158.69.213.106%3A3000%2Ft%2Frifas%2Fimagen.jpg" />
```

**NO debe ser:**
```html
❌ <img src="http://158.69.213.106:3000/t/rifas/imagen.jpg" />
```

### 4. Test de API

Visita: **http://localhost:3000/api/test-proxy**

Verás información de configuración del proxy.

## 📋 Checklist de Componentes

Todos estos componentes YA están usando `getImageUrl()`:

- ✅ `components/FeaturedRaffles.tsx` - Hero principal
- ✅ `components/LatestDraws.tsx` - Sorteos completados  
- ✅ `components/TicketVerifier.tsx` - Verificador
- ✅ `components/MobileHero.tsx` - Vista móvil (TODAS las imágenes)
- ✅ `components/PrizesModal.tsx` - Modal de premios
- ✅ `components/admin/RaffleManagement.tsx` - Panel admin
- ✅ `app/raffle/[id]/page.tsx` - Detalle de rifa

## 🧪 Test Completo

### Paso 1: Subir una imagen
```bash
1. Ve al panel de admin → http://localhost:3000/admin
2. Crea una nueva rifa con imagen
3. Guarda
```

### Paso 2: Verificar en la base de datos
```bash
# La URL guardada debe ser:
http://158.69.213.106:3000/t/rifas/nombre-imagen.jpg
```

### Paso 3: Ver en la página principal
```bash
1. Ve a → http://localhost:3000
2. Abre DevTools → Network
3. Busca "image-proxy"
4. Debes ver las solicitudes pasando por el proxy
```

### Paso 4: Inspeccionar HTML
```bash
1. Click derecho en la imagen → Inspeccionar
2. El src debe ser: /api/image-proxy?url=...
3. NO debe ser la URL directa de Openinary
```

## ⚠️ Solución de Problemas

### Problema: La imagen no carga

**Causa 1: Servidor Openinary no accesible**
```bash
# Test manual:
curl http://158.69.213.106:3000/t/rifas/test.jpg

# Si falla, el servidor está caído o bloqueado
```

**Causa 2: URL incorrecta en la base de datos**
```bash
# Verifica que la URL sea:
http://158.69.213.106:3000/t/carpeta/archivo.jpg

# NO debe ser:
/t/carpeta/archivo.jpg (relativa)
```

**Causa 3: Proxy devuelve error**
```bash
# Abre directamente:
http://localhost:3000/api/image-proxy?url=http%3A%2F%2F158.69.213.106%3A3000%2Ft%2Frifas%2Ftest.jpg

# Debe mostrar la imagen o un error específico
```

### Problema: Veo la URL directa de Openinary

**Causa: Componente no usa `getImageUrl()`**
```typescript
// ❌ MAL
<Image src={raffle.image} />

// ✅ BIEN
<Image src={getImageUrl(raffle.image)} />
```

**Solución:**
```bash
# Buscar componentes que NO usen getImageUrl:
grep -r "src={.*raffle.*image" components/
grep -r "src={.*image" components/ | grep -v "getImageUrl"
```

### Problema: Error 403 en el proxy

**Causa: URL no autorizada**

El proxy solo acepta:
- `158.69.213.106` (Openinary)
- `localhost`
- `127.0.0.1`

**Solución:** Verifica que la URL sea del servidor correcto.

## 🎉 Resultado Final

Cuando todo funcione correctamente:

1. ✅ Subes imagen → Se guarda en Openinary
2. ✅ URL en DB → `http://158.69.213.106:3000/t/...`
3. ✅ HTML del navegador → `/api/image-proxy?url=...`
4. ✅ Network → Todas las imágenes pasan por el proxy
5. ✅ Usuario → Ve las imágenes sin problemas
6. ✅ Sin CORS → Sin errores de seguridad

## 📝 Comandos Útiles

```bash
# Iniciar servidor
bun dev

# Ver página de test
http://localhost:3000/test-images

# Ver info del proxy
http://localhost:3000/api/test-proxy

# Buscar URLs directas (no debería haber ninguna)
grep -r "158.69.213.106" components/ --include="*.tsx" | grep -v "getImageUrl"
```

## ✨ Estado Actual

- ✅ Proxy configurado y funcionando
- ✅ TODOS los componentes actualizados
- ✅ getImageUrl() convierte automáticamente
- ✅ HTML solo muestra URLs del proxy
- ✅ Sin URLs directas de Openinary en el navegador
- ✅ CORS resuelto completamente

**¡TODO LISTO! 🚀**
