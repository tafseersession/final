'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { PanelCard } from './panel-card'
import { Activity } from 'lucide-react'

interface ActivityItem {
  id: string
  icon?: React.ReactNode
  title: string
  description?: string
  timestamp?: string
  status?: 'active' | 'pending' | 'completed' | 'error'
}

interface ActivityPanelProps extends React.ComponentProps<'div'> {
  title?: string
  description?: string
  items?: ActivityItem[]
  isEmpty?: boolean
  emptyMessage?: string
  maxItems?: number
}

const statusColors = {
  active: 'bg-green-500/20 text-green-700 dark:text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  completed: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  error: 'bg-destructive/20 text-destructive',
}

export function ActivityPanel({
  title = 'Recent Activity',
  description = 'Latest updates and changes',
  items = [],
  isEmpty = false,
  emptyMessage = 'No recent activity',
  maxItems = 5,
  className,
  ...props
}: ActivityPanelProps) {
  const displayItems = items.slice(0, maxItems)
  const hasItems = displayItems.length > 0 && !isEmpty

  return (
    <PanelCard
      icon={<Activity className="h-5 w-5" />}
      title={title}
      description={description}
      className={className}
      {...props}
    >
      {hasItems ? (
        <div className="space-y-3">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {item.icon && (
                <div className="mt-0.5 shrink-0 text-muted-foreground">{item.icon}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {item.status && (
                  <span className={cn('inline-flex px-2 py-1 rounded text-xs font-medium', statusColors[item.status])}>
                    {item.status}
                  </span>
                )}
                {item.timestamp && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.timestamp}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </PanelCard>
  )
}
