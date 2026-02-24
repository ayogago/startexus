'use client'

import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'

interface PasswordStrengthProps {
  password: string
}

interface StrengthResult {
  score: number
  label: string
  color: string
  suggestions: string[]
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength: StrengthResult = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: '',
        color: 'bg-gray-200',
        suggestions: []
      }
    }

    let score = 0
    const suggestions: string[] = []

    // Length check
    if (password.length >= 8) score += 25
    else suggestions.push('Use at least 8 characters')

    if (password.length >= 12) score += 10

    // Lowercase check
    if (/[a-z]/.test(password)) score += 15
    else suggestions.push('Add lowercase letters')

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 15
    else suggestions.push('Add uppercase letters')

    // Number check
    if (/[0-9]/.test(password)) score += 15
    else suggestions.push('Add numbers')

    // Special character check
    if (/[^a-zA-Z0-9]/.test(password)) score += 20
    else suggestions.push('Add special characters (!@#$%^&*)')

    let label = ''
    let color = ''

    if (score < 40) {
      label = 'Weak'
      color = 'bg-red-500'
    } else if (score < 60) {
      label = 'Fair'
      color = 'bg-orange-500'
    } else if (score < 80) {
      label = 'Good'
      color = 'bg-yellow-500'
    } else {
      label = 'Strong'
      color = 'bg-green-500'
    }

    return { score, label, color, suggestions }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium min-w-[60px]">{strength.label}</span>
      </div>
      {strength.suggestions.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {strength.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center gap-1">
              <span className="text-gray-400">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
