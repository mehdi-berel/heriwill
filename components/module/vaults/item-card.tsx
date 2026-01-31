"use client"

import { Badge } from "@/components/ui/badge"
import { 
  Key, 
  StickyNote, 
  Bitcoin, 
  FileText, 
  Image as ImageIcon, 
  Video,
  Lock,
  ChevronRight,
  Scale,
  Package
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

interface VaultItemCardProps {
  item: VaultItem
  onPress: () => void
  onLongPress?: () => void
  isSelected?: boolean
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
        (metadata.content.length > 30 ? `${metadata.content.substring(0, 30)}...` : metadata.content) : 
        'Note'
    case 'crypto':
      if (metadata.walletAddress) {
        return metadata.walletAddress.length > 15 ? 
          `${metadata.walletAddress.substring(0, 6)}...${metadata.walletAddress.slice(-4)}` : 
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

export function VaultItemCard({ 
  item, 
  onPress,
  onLongPress,
  isSelected = false,
}: VaultItemCardProps) {
  const ItemIcon = itemIcons[item.type] || FileText
  const typeColor = itemTypeColors[item.type] || itemTypeColors.other

  return (
    <div
      onClick={onPress}
      onContextMenu={(e) => {
        e.preventDefault()
        onLongPress?.()
      }}
      className={`flex items-center p-4 bg-background-card border rounded-xl cursor-pointer hover:border-primary/50 transition-all group ${
        isSelected ? 'border-primary bg-primary/5' : ''
      }`}
      style={{ borderColor: isSelected ? undefined : '#232629' }}
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
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${typeColor}`}>
            {itemTypeLabels[item.type]}
          </Badge>
          <span className="text-sm text-muted-foreground truncate">
            {getItemSubtitle(item)}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </div>
  )
}
