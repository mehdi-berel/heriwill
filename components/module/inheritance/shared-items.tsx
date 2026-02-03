"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, User, Calendar, Lock } from "lucide-react"

interface SharedItem {
  id: string
  title: string
  type: string
  shared_by: string
  shared_at: string
  access_level: 'view' | 'edit' | 'full'
  is_encrypted: boolean
}

interface SharedItemsProps {
  items: SharedItem[]
  onItemClick?: (itemId: string) => void
}

const ACCESS_LEVEL_COLORS = {
  view: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  edit: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  full: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
}

export function SharedItems({ items, onItemClick }: SharedItemsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No shared items</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <CardHeader className="px-0">
        <CardTitle className="text-lg">Shared Items</CardTitle>
      </CardHeader>
      <div className="space-y-2">
        {items.map((item) => (
          <Card 
            key={item.id}
            className={`hover:border-primary/50 transition-colors ${onItemClick ? 'cursor-pointer' : ''}`}
            onClick={() => onItemClick?.(item.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    {item.is_encrypted && (
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">Shared by {item.shared_by}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.shared_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <Badge 
                    className={`text-xs ${ACCESS_LEVEL_COLORS[item.access_level]}`}
                  >
                    {item.access_level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
