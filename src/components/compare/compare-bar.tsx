'use client'

import { useCompare } from './compare-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X, GitCompareArrows, Trash2 } from 'lucide-react'

export function CompareBar() {
  const { items, removeItem, clearAll } = useCompare()
  const router = useRouter()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-500 shadow-2xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Items being compared */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <div className="flex items-center gap-1 text-sm font-semibold text-blue-700 shrink-0">
              <GitCompareArrows className="w-4 h-4" />
              <span>Compare ({items.length}/4)</span>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 shrink-0"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <span className="text-sm font-medium text-gray-800 max-w-[140px] truncate">
                  {item.title}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${item.title} from comparison`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center justify-center w-32 h-10 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-400 shrink-0"
              >
                + Add listing
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-gray-600 hover:text-red-600 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/compare')}
              disabled={items.length < 2}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <GitCompareArrows className="w-4 h-4 mr-1" />
              Compare Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
