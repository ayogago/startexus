'use client'

import { useCompare } from '@/components/compare/compare-provider'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { X, GitCompareArrows, ArrowLeft, ExternalLink, Trophy } from 'lucide-react'

function bestValue(
  values: (number | null | undefined)[],
  mode: 'highest' | 'lowest'
): number | null {
  const valid = values.filter((v): v is number => v != null && v > 0)
  if (valid.length < 2) return null
  if (mode === 'highest') return Math.max(...valid)
  return Math.min(...valid)
}

function CellValue({
  value,
  format,
  best,
}: {
  value: number | null | undefined
  format: 'currency' | 'number' | 'hours'
  best: number | null
}) {
  if (value == null) {
    return <span className="text-gray-400">N/A</span>
  }

  const isBest = best != null && value === best
  let display: string

  if (format === 'currency') {
    display = formatCurrency(value)
  } else if (format === 'hours') {
    display = `${value} hrs/wk`
  } else {
    display = formatNumber(value)
  }

  return (
    <span className={`font-semibold ${isBest ? 'text-green-600' : 'text-gray-900'}`}>
      {isBest && <Trophy className="w-3.5 h-3.5 inline mr-1 text-green-500" />}
      {display}
    </span>
  )
}

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <GitCompareArrows className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Listings to Compare</h1>
          <p className="text-gray-600 mb-6">
            Add listings to your compare list from the browse page to see them side by side.
          </p>
          <Button asChild>
            <Link href="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Listings
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const prices = items.map(i => i.askingPrice)
  const mrrs = items.map(i => i.mrr)
  const revenues = items.map(i => i.revenueTtm)
  const profits = items.map(i => i.profitTtm)
  const traffics = items.map(i => i.trafficTtm)
  const workloads = items.map(i => i.workloadHrsPerWk)
  const teamSizes = items.map(i => i.teamSize)

  const bestPrice = bestValue(prices, 'lowest')
  const bestMrr = bestValue(mrrs, 'highest')
  const bestRevenue = bestValue(revenues, 'highest')
  const bestProfit = bestValue(profits, 'highest')
  const bestTraffic = bestValue(traffics, 'highest')
  const bestWorkload = bestValue(workloads, 'lowest')
  const bestTeamSize = bestValue(teamSizes, 'lowest')

  const rows: {
    label: string
    values: (number | null | undefined)[]
    format: 'currency' | 'number' | 'hours'
    best: number | null
  }[] = [
    { label: 'Asking Price', values: prices, format: 'currency', best: bestPrice },
    { label: 'Monthly Revenue (MRR)', values: mrrs, format: 'currency', best: bestMrr },
    { label: 'Annual Revenue', values: revenues, format: 'currency', best: bestRevenue },
    { label: 'Annual Profit', values: profits, format: 'currency', best: bestProfit },
    { label: 'Monthly Traffic', values: traffics, format: 'number', best: bestTraffic },
    { label: 'Workload (hrs/wk)', values: workloads, format: 'hours', best: bestWorkload },
    { label: 'Team Size', values: teamSizes, format: 'number', best: bestTeamSize },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/browse">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Browse
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Compare Listings</h1>
          <p className="text-gray-600 mt-1">
            Side-by-side comparison of {items.length} listing{items.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" onClick={clearAll} size="sm" className="text-red-600 hover:bg-red-50">
          Clear All
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 w-48 text-sm font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10">
                  Metric
                </th>
                {items.map((item) => (
                  <th key={item.id} className="p-4 min-w-[200px]">
                    <div className="flex flex-col items-center text-center gap-2">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <Link
                        href={`/listings/${item.slug}`}
                        className="font-semibold text-blue-600 hover:text-blue-800 text-sm line-clamp-2"
                      >
                        {item.title}
                        <ExternalLink className="w-3 h-3 inline ml-1" />
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Business Type Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm font-medium text-gray-600 sticky left-0 bg-white z-10">
                  Business Type
                </td>
                {items.map((item) => (
                  <td key={item.id} className="p-4 text-center">
                    <Badge variant="outline">{item.businessType}</Badge>
                  </td>
                ))}
              </tr>

              {/* Metric Rows */}
              {rows.map((row, rowIdx) => (
                <tr
                  key={row.label}
                  className={`border-b hover:bg-gray-50 ${rowIdx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="p-4 text-sm font-medium text-gray-600 sticky left-0 bg-white z-10">
                    {row.label}
                  </td>
                  {row.values.map((value, colIdx) => (
                    <td key={items[colIdx].id} className="p-4 text-center">
                      <CellValue value={value} format={row.format} best={row.best} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Details links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {items.map((item) => (
          <Button key={item.id} asChild variant="outline" className="w-full">
            <Link href={`/listings/${item.slug}`}>
              View {item.title.length > 20 ? item.title.slice(0, 20) + '...' : item.title}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
