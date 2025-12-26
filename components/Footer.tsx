import Image from "next/image"
import siteConfig from "@/config/site"
import { Telegram } from "@/components/Telegram"

export default function Footer() {
  return (
    <footer className="bg-black py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Soporte Section */}
        <div className="text-center mb-6">
          <h2 className="text-white text-lg font-bold mb-4">Soporte</h2>
          
          <div className="flex items-center justify-center">
            <a href="https://t.me/+584166571872" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center hover:opacity-80 transition-opacity">
              <Telegram className="w-10 h-10" />
            </a>
          </div>
        </div>

                {/* Lottery Logos */}
                <div className="flex flex-row items-center justify-center space-x-6">
                  <div className="w-20 h-20 relative">
                    <Image
                      src="/1.png"
                      alt="Logo 1"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="w-20 h-20 relative">
                    <Image
                      src="/2.png"
                      alt="Logo 2"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="w-20 h-20 relative">
                    <Image
                      src="/3.png"
                      alt="Logo 3"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

        {/* Copyright */}
        <div className="text-center mt-6 pt-4 border-t border-gray-800">
          <p className="text-gray-400 text-sm">© 2025 {siteConfig.siteName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
