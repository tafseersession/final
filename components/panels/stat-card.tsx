'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps extends React.ComponentProps<'div'> {
  icon?: React.ReactNode
  label: string
  value: string | number
  change?: {
    value: number
    type: 'positive' | 'negative'
    label: string
  }
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'destructive'
}

const colorMap = {
  primary: 'bg-primary/15 border-primary/20 text-primary',
  accent: 'bg-accent/15 border-accent/20 text-accent',
  success: 'bg-green-500/15 border-green-500/20 text-green-600 dark:text-green-400',
  warning: 'bg-yellow-500/15 border-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  destructive: 'bg-destructive/15 border-destructive/20 text-destructive',
}

export function StatCard({
  icon,
  label,
  value,
  change,
  color = 'primary',
  className,
  ...props
}: StatCardProps) {
  return (
    <Card variant="stat" className={cn('stat-card', className)} {...props}>
      {icon && (
        <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-lg border', colorMap[color])}>
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <p className="stat-label">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="stat-value">{value}</p>
          {change && (
            <span className={cn('stat-change', change.type === 'positive' ? 'stat-change-positive' : 'stat-change-negative')}>
              <span className="flex items-center gap-1">
                {change.type === 'positive' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change.value}% {change.label}
              </span>
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
