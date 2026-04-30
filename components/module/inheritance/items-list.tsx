"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Download,
  Search,
  FolderOpen,
  ChevronRight
} from "lucide-react"

interface VaultItem {
  id: string
  title_encrypted: string
  item_type: string
  is_favorite: boolean | null
  created_at: string
  file_size: number | null
  metadata?: Record<string, unknown>
}

interface ItemsListProps {
  items: VaultItem[]
  onItemClick?: (itemId: string) => void
  onDownloadItem?: (itemId: string) => void
  searchTerm?: string
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

export function ItemsList({ items, onItemClick, onDownloadItem, searchTerm = '' }: ItemsListProps) {
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
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getItemSubtitle = (item: VaultItem): string => {
    const metadata = item.metadata as Record<string, string | undefined> | undefined

    switch (item.item_type) {
      case 'password':
        return metadata?.username || metadata?.url || 'Password'
      case 'document':
        return metadata?.fileName || metadata?.description || 'Document'
      case 'video':
        return metadata?.fileName || metadata?.description || 'Video'
      case 'image':
        return metadata?.fileName || metadata?.description || 'Image'
      case 'note':
        return metadata?.content ?
          (metadata.content.length > 50 ? `${metadata.content.substring(0, 50)}...` : metadata.content) :
          'Note'
      case 'crypto':
        if (metadata?.walletAddress) {
          return metadata.walletAddress.length > 20 ?
            `${metadata.walletAddress.substring(0, 10)}...${metadata.walletAddress.slice(-6)}` :
            metadata.walletAddress
        }
        return metadata?.network || 'Crypto Wallet'
      case 'legal':
        return metadata?.description || 'Legal Document'
      case 'assets':
        return metadata?.description || 'Asset'
      default:
        return metadata?.description || 'Item'
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm ||
      item.title_encrypted.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getItemSubtitle(item).toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA
  })

  if (sortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <FolderOpen className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No items found</h3>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          {searchTerm ? 'Try adjusting your search.' : 'No items in this vault.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchTerm}
          disabled
          className="pl-10 h-11"
        />
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {sortedItems.map((item) => {
          const Icon = ITEM_TYPE_ICONS[item.item_type as keyof typeof ITEM_TYPE_ICONS] || FileText
          const colorClass = ITEM_TYPE_COLORS[item.item_type as keyof typeof ITEM_TYPE_COLORS] || ITEM_TYPE_COLORS.other

          return (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="flex items-center p-4 bg-background-card border rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
              style={{ borderColor: '#232629' }}
            >
              {/* Icon Container */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold truncate">{item.title_encrypted || 'Untitled'}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${colorClass}`}>
                    {item.item_type}
                  </Badge>
                  <span className="truncate">{getItemSubtitle(item)}</span>
                  {item.file_size && (
                    <>
                      <span>•</span>
                      <span>{formatFileSize(item.file_size)}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={(e) => handleDownload(item.id, e)}
                  disabled={downloading === item.id}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
