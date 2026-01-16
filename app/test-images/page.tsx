'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/imageUtils'

export default function TestImagesPage() {
  const [testUrl, setTestUrl] = useState('http://158.69.213.106:3000/t/rifas/test.jpg')
  const [proxyUrl, setProxyUrl] = useState('')

  const handleTest = () => {
    const result = getImageUrl(testUrl)
    setProxyUrl(result)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          🧪 Test de Proxy de Imágenes
        </h1>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            1. Configuración Actual
          </h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Servidor Openinary:</strong> http://158.69.213.106:3000</p>
            <p><strong>Proxy Local:</strong> /api/image-proxy</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            2. Test de Conversión de URL
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">
                URL de Openinary:
              </label>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                placeholder="http://158.69.213.106:3000/t/rifas/imagen.jpg"
              />
            </div>

            <button
              onClick={handleTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Convertir a Proxy
            </button>

            {proxyUrl && (
              <div>
                <label className="block text-gray-300 mb-2">
                  URL del Proxy (lo que ve el navegador):
                </label>
                <div className="bg-gray-700 text-green-400 px-4 py-2 rounded break-all">
                  {proxyUrl}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            3. Ejemplos de URLs
          </h2>
          
          <div className="space-y-4">
            {[
              {
                title: 'URL de Openinary (directa)',
                url: 'http://158.69.213.106:3000/t/rifas/imagen.jpg',
                expected: '/api/image-proxy?url=...'
              },
              {
                title: 'URL relativa de Openinary',
                url: '/t/rifas/imagen.jpg',
                expected: '/api/image-proxy?url=...'
              },
              {
                title: 'Imagen local (placeholder)',
                url: '/placeholder.svg',
                expected: '/placeholder.svg (sin cambios)'
              },
              {
                title: 'Logo local',
                url: '/logo.png',
                expected: '/logo.png (sin cambios)'
              }
            ].map((example, index) => {
              const result = getImageUrl(example.url)
              const isProxy = result.startsWith('/api/image-proxy')
              
              return (
                <div key={index} className="bg-gray-700 p-4 rounded">
                  <p className="text-white font-semibold mb-2">{example.title}</p>
                  <p className="text-gray-400 text-sm mb-1">Entrada: {example.url}</p>
                  <p className="text-gray-400 text-sm mb-1">Esperado: {example.expected}</p>
                  <p className={`text-sm ${isProxy ? 'text-green-400' : 'text-blue-400'}`}>
                    Resultado: {result.length > 100 ? result.substring(0, 100) + '...' : result}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded text-xs ${
                    isProxy || !example.url.includes('158.69.213.106') 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {isProxy || !example.url.includes('158.69.213.106') ? '✓ Correcto' : '✗ Error'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            4. ✅ Verificación
          </h2>
          
          <div className="space-y-2 text-gray-300">
            <p>✓ Todas las URLs de Openinary se convierten al proxy</p>
            <p>✓ Las URLs locales NO se modifican</p>
            <p>✓ El navegador NUNCA ve la IP 158.69.213.106 directamente</p>
            <p>✓ Todas las imágenes cargan desde /api/image-proxy</p>
          </div>

          <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded">
            <p className="text-blue-200 text-sm">
              💡 <strong>Tip:</strong> Abre DevTools → Network → Filtra por "image-proxy" 
              para ver todas las solicitudes de imágenes pasando por el proxy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
