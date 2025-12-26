"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import siteConfig from "@/config/site"
import WhatsApp from "@/components/Whatsapp"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-black/95 backdrop-blur-md border-b border-yellow-400/30 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain"/>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-[#febd59] transition-all duration-300 font-medium hover:scale-105"
            >
              Inicio
            </Link>
            <Link
              href="/verify"
              className="text-white hover:text-[#febd59] transition-all duration-300 font-medium hover:scale-105"
            >
              Verificar Tickets
            </Link>
            <a
              href="https://wa.me/584127452761"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-white hover:text-[#25D366] transition-colors"
            >
              <WhatsApp className="w-6 h-6" />
            </a>
          </div>

      

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-[#febd59]/30 bg-black/50 backdrop-blur-md rounded-b-lg">
              <Link
                href="/"
                className="block px-4 py-3 text-white hover:text-[#febd59] hover:bg-[#febd59]/10 transition-all duration-300 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/verify"
                className="block px-4 py-3 text-white hover:text-[#febd59] hover:bg-[#febd59]/10 transition-all duration-300 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Verificar Tickets
              </Link>
              <a
                href="https://wa.me/584127452761"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-3 text-white hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all duration-300 rounded-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                <WhatsApp className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
