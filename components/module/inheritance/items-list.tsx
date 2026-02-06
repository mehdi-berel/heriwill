"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText,
  Key,
  StickyNote,
  Bitcoin,
  Image as ImageIcon,
  Video,
  Scale,
  Package,
  Calendar,
  Download
} from "lucide-react"

interface VaultItem {
  id: string
  title_encrypted: string
  item_type: string
  is_favorite: boolean | null
  created_at: string
  file_size: number | null
}

interface ItemsListProps {
  items: VaultItem[]
  onItemClick?: (itemId: string) => void
  onDownloadItem?: (itemId: string) => void
}

const ITEM_TYPE_ICONS = {
  password: Key,
  note: StickyNote,
  document: FileText,
  image: ImageIcon,
  video: Video,
  crypto: Bitcoin,
  legal: Scale,
  assets: Package,
  other: FileText
}

const ITEM_TYPE_COLORS = {
  password: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  note: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  document: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  image: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  video: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  crypto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  legal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  assets: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

export function ItemsList({ items, onItemClick, onDownloadItem }: ItemsListProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onDownloadItem) return
    setDownloading(itemId)
    try {
      await onDownloadItem(itemId)
    } finally {
      setDownloading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No items in this vault</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = ITEM_TYPE_ICONS[item.item_type as keyof typeof ITEM_TYPE_ICONS] || FileText
        const colorClass = ITEM_TYPE_COLORS[item.item_type as keyof typeof ITEM_TYPE_COLORS] || ITEM_TYPE_COLORS.other

        return (
          <Card 
            key={item.id} 
            className={`hover:border-primary/50 transition-colors ${onItemClick ? 'cursor-pointer' : ''}`}
            onClick={() => onItemClick?.(item.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium truncate flex-1">{item.title_encrypted || 'Untitled'}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      onClick={(e) => handleDownload(item.id, e)}
                      disabled={downloading === item.id}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {item.item_type}
                    </Badge>
                    {item.file_size && (
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(item.file_size)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
