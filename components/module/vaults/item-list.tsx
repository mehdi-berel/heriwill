"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search,
  Plus,
  FolderOpen,
  Key,
  StickyNote,
  Bitcoin,
  FileText,
  Image as ImageIcon,
  Video,
  Lock,
  Scale,
  Package,
  ChevronRight
} from "lucide-react"

export type VaultItemType = 'password' | 'document' | 'video' | 'image' | 'note' | 'crypto' | 'bank' | 'other' | 'legal' | 'assets'

export interface VaultItemMetadata {
  username?: string
  password?: string
  url?: string
  walletAddress?: string
  privateKey?: string
  network?: string
  content?: string
  fileName?: string
  fileUrl?: string
  fileSize?: string
  fileSizeBytes?: number
  description?: string
  linkedDocumentId?: string
  linkedAssetId?: string
  linkedItemType?: 'legal' | 'asset'
}

export interface VaultItem {
  id?: string
  title: string
  type: VaultItemType
  metadata: VaultItemMetadata
  isEncrypted: boolean
  tags: string[]
  createdAt?: string
  updatedAt?: string
}

interface ItemListProps {
  items: VaultItem[]
  onItemSelect: (item: VaultItem) => void
  onAddItem?: () => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  selectedItemType?: VaultItemType | null
  showAddButton?: boolean
  emptyMessage?: string
  vaultCategory?: 'share' | 'delete'
}

const itemIcons: Record<VaultItemType, typeof Key> = {
  password: Key,
  document: FileText,
  video: Video,
  image: ImageIcon,
  note: StickyNote,
  crypto: Bitcoin,
  bank: FileText,
  legal: Scale,
  assets: Package,
  other: FileText,
}

const itemTypeLabels: Record<VaultItemType, string> = {
  password: 'Password',
  document: 'Document',
  video: 'Video',
  image: 'Image',
  note: 'Note',
  crypto: 'Crypto',
  bank: 'Bank',
  legal: 'Legal',
  assets: 'Asset',
  other: 'Other',
}

const itemTypeColors: Record<VaultItemType, string> = {
  password: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  document: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  image: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  note: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  crypto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  bank: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  legal: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  assets: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

function getItemSubtitle(item: VaultItem): string {
  const metadata = item.metadata

  switch (item.type) {
    case 'password':
      return metadata.username || metadata.url || 'Password'
    case 'document':
      return metadata.fileName || metadata.description || 'Document'
    case 'video':
      return metadata.fileName || metadata.description || 'Video'
    case 'image':
      return metadata.fileName || metadata.description || 'Image'
    case 'note':
      return metadata.content ? 
        (metadata.content.length > 50 ? `${metadata.content.substring(0, 50)}...` : metadata.content) : 
        'Note'
    case 'crypto':
      if (metadata.walletAddress) {
        return metadata.walletAddress.length > 20 ? 
          `${metadata.walletAddress.substring(0, 10)}...${metadata.walletAddress.slice(-6)}` : 
          metadata.walletAddress
      }
      return metadata.network || 'Crypto Wallet'
    case 'legal':
      return metadata.description || 'Legal Document'
    case 'assets':
      return metadata.description || 'Asset'
    case 'bank':
      return metadata.description || 'Bank Account'
    default:
      return metadata.description || 'Item'
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function ItemList({ 
  items, 
  onItemSelect,
  onAddItem,
  searchTerm = '',
  onSearchChange,
  selectedItemType = null,
  showAddButton = true,
  emptyMessage = 'No items found',
  vaultCategory
}: ItemListProps) {
  const router = useRouter()
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm)

  const handleSearchChange = (value: string) => {
    setInternalSearchTerm(value)
    onSearchChange?.(value)
  }

  const filteredItems = items.filter(item => {
    const searchValue = onSearchChange ? searchTerm : internalSearchTerm
    const matchesSearch = !searchValue || 
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase())) ||
      getItemSubtitle(item).toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesType = selectedItemType === null || item.type === selectedItemType
    
    return matchesSearch && matchesType
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateB - dateA
  })

  return (
    <div className="space-y-4">
      {/* Search Bar, Assets/Legal Buttons, and Add Button */}
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={onSearchChange ? searchTerm : internalSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 sm:h-10"
          />
        </div>
        
        {showAddButton && onAddItem && (
          <Button onClick={onAddItem} className="h-11 sm:h-10 flex-shrink-0">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        )}
      </div>

      {/* Items List */}
      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <FolderOpen className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No items found</h3>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            {(onSearchChange ? searchTerm : internalSearchTerm) || selectedItemType !== null
              ? 'Try adjusting your search or filters.' 
              : emptyMessage}
          </p>
          {showAddButton && onAddItem && (
            <Button onClick={onAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item) => {
            const ItemIcon = itemIcons[item.type] || FileText
            const typeColor = itemTypeColors[item.type] || itemTypeColors.other

            return (
              <div
                key={item.id || item.title}
                onClick={() => onItemSelect(item)}
                className="flex items-center p-4 bg-background-card border rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
                style={{ borderColor: '#232629' }}
              >
                {/* Icon Container */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${typeColor}`}>
                  <ItemIcon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold truncate">{item.title}</h3>
                    {item.isEncrypted && (
                      <Badge variant="secondary" className="px-1.5 py-0.5 bg-yellow-500/20">
                        <Lock className="h-3 w-3 text-yellow-600" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${typeColor}`}>
                      {itemTypeLabels[item.type]}
                    </Badge>
                    <span className="truncate">{getItemSubtitle(item)}</span>
                    {item.metadata.fileSizeBytes && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(item.metadata.fileSizeBytes)}</span>
                      </>
                    )}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
