'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CompareItem {
  id: string
  title: string
  businessType: string
  askingPrice: number | null
  mrr: number | null
  revenueTtm: number | null
  profitTtm: number | null
  trafficTtm: number | null
  workloadHrsPerWk: number | null
  teamSize: number | null
  slug: string
  imageUrl?: string
}

interface CompareContextType {
  items: CompareItem[]
  addItem: (item: CompareItem) => void
  removeItem: (id: string) => void
  clearAll: () => void
  isInCompare: (id: string) => boolean
}

const CompareContext = createContext<CompareContextType | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([])

  const addItem = (item: CompareItem) => {
    if (items.length >= 4) return // Max 4 items
    if (items.find(i => i.id === item.id)) return
    setItems(prev => [...prev, item])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clearAll = () => setItems([])
  const isInCompare = (id: string) => items.some(i => i.id === id)

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, clearAll, isInCompare }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used within CompareProvider')
  return context
}

export type { CompareItem }
