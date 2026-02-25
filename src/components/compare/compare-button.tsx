'use client'

import { useCompare, type CompareItem } from './compare-provider'
import { Button } from '@/components/ui/button'
import { GitCompareArrows, Check } from 'lucide-react'

interface CompareButtonProps {
  listing: CompareItem
  variant?: 'icon' | 'full'
  className?: string
}

export function CompareButton({ listing, variant = 'icon', className = '' }: CompareButtonProps) {
  const { addItem, removeItem, isInCompare, items } = useCompare()
  const inCompare = isInCompare(listing.id)
  const isFull = items.length >= 4 && !inCompare

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inCompare) {
      removeItem(listing.id)
    } else {
      addItem(listing)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isFull}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          inCompare
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : isFull
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
        } ${className}`}
        title={inCompare ? 'Remove from comparison' : isFull ? 'Compare list full (max 4)' : 'Add to comparison'}
      >
        {inCompare ? <Check className="w-4 h-4" /> : <GitCompareArrows className="w-4 h-4" />}
      </button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isFull}
      variant={inCompare ? 'default' : 'outline'}
      size="sm"
      className={`${
        inCompare
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'hover:border-blue-400 hover:text-blue-600'
      } ${className}`}
    >
      {inCompare ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          Added
        </>
      ) : (
        <>
          <GitCompareArrows className="w-4 h-4 mr-1" />
          Compare
        </>
      )}
    </Button>
  )
}
