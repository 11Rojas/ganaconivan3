'use client'
import MobileHero from "@/components/MobileHero"
import LatestDraws from "@/components/LatestDraws"
import { useState, useEffect } from "react"
import type { Raffle } from "@/lib/types"

export default function HomePage() {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [otherRaffles, setOtherRaffles] = useState<Raffle[]>([])
  const [exchangeRate, setExchangeRate] = useState(36)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get active raffles
        const rafflesResponse = await fetch("/api/raffles/active")
        if (!rafflesResponse.ok) throw new Error("Error al cargar las rifas")
        const rafflesData = await rafflesResponse.json()
        
        if (rafflesData.length > 0) {
          setRaffle(rafflesData[0])
          // Las otras rifas son todas excepto la primera
          setOtherRaffles(rafflesData.slice(1))
        }

        // Get exchange rate
        const exchangeResponse = await fetch("/api/exchange-rate")
        if (exchangeResponse.ok) {
          const exchangeData = await exchangeResponse.json()
          setExchangeRate(exchangeData.rate || 36)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white">Cargando...</p>
        </div>
      </main>
    )
  }

  if (!raffle) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">No hay rifas activas en este momento</p>
          <p className="text-gray-400">Vuelve más tarde para ver nuevas rifas</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <MobileHero raffle={raffle} exchangeRate={exchangeRate} otherRaffles={otherRaffles} />
      <LatestDraws />
    </main>
  )
}
