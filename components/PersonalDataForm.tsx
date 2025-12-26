'use client'

import { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'

interface PersonalDataFormProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  onPay: (data: PersonalData) => void
}

interface PersonalData {
  fullName: string
  idType: string
  idNumber: string
  phone: string
  email: string
}

export default function PersonalDataForm({ 
  isOpen, 
  onClose, 
  onBack, 
  onPay 
}: PersonalDataFormProps) {
  const [formData, setFormData] = useState<PersonalData>({
    fullName: '',
    idType: 'V',
    idNumber: '',
    phone: '',
    email: ''
  })

  const handleInputChange = (field: keyof PersonalData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar datos
    if (!formData.fullName.trim()) {
      alert('Por favor ingresa tu nombre completo')
      return
    }
    
    if (!formData.idNumber.trim()) {
      alert('Por favor ingresa tu número de cédula')
      return
    }
    
    if (!formData.phone.trim()) {
      alert('Por favor ingresa tu número de teléfono')
      return
    }
    
    if (!formData.email.trim()) {
      alert('Por favor ingresa tu correo electrónico')
      return
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Por favor ingresa un correo electrónico válido')
      return
    }
    
    // Validar formato de teléfono (al menos 10 dígitos)
    const phoneRegex = /^\d{10,}$/
    const cleanPhone = formData.phone.replace(/\D/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      alert('Por favor ingresa un número de teléfono válido (mínimo 10 dígitos)')
      return
    }
    
    onPay(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-800 z-50 flex flex-col">
      {/* Close Button - Solo el botón X */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pt-16 pb-4 bg-gray-800">
        <div className="max-w-md mx-auto">
          {/* Title */}
          <h1 className="text-white text-xl font-bold text-center mb-8">
            Indica tus datos
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre Completo */}
            <div>
              <label className="text-white text-sm block mb-2">Nombre Completo</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Escribe tu nombre completo"
                className="w-full bg-gray-700 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            {/* Cédula */}
            <div>
              <label className="text-white text-sm block mb-2">Cédula</label>
              <div className="flex space-x-2">
                <select
                  value={formData.idType}
                  onChange={(e) => handleInputChange('idType', e.target.value)}
                  className="w-16 bg-gray-700 border border-gray-500 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="V">V</option>
                  <option value="E">E</option>
                  <option value="J">J</option>
                </select>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  placeholder="Escribe tu cédula"
                  className="flex-1 bg-gray-700 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-white text-sm block mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Escribe tu teléfono"
                className="w-full bg-gray-700 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            {/* Correo electrónico */}
            <div>
              <label className="text-white text-sm block mb-2">Correo electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Escribe tu correo electrónico"
                className="w-full bg-gray-700 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 flex items-center justify-center space-x-2 bg-transparent border border-gray-500 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
              
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors"
              >
                Pagar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
