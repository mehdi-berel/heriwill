"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  FolderOpen, 
  Lock, 
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  Key,
  Search,
  Plus,
  StickyNote,
  Bitcoin,
  Scale,
  Package
} from "lucide-react"
import { ItemForm } from "./item-form"
import { ItemDetails } from "./item-details"

type VaultItemType = 'password' | 'document' | 'video' | 'image' | 'note' | 'crypto' | 'bank' | 'other' | 'legal' | 'assets'

interface VaultItemMetadata {
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

interface VaultItem {
  id?: string
  title: string
  type: VaultItemType
  metadata: VaultItemMetadata
  isEncrypted: boolean
  tags: string[]
  createdAt?: string
  updatedAt?: string
}

interface Vault {
  id: string
  name: string
  description: string
  category: 'share_after_death' | 'delete_after_death' | 'sign_off_after_death'
  is_encrypted: boolean
  is_locked: boolean
  is_favorite: boolean
  is_shared: boolean
  tags: string[]
  item_count: number
  created_at: string
  last_accessed?: string
  icon?: string
  color?: string
  access_control: {
    allowedHeirs: string[]
    requireApproval: boolean
  }
  death_settings: {
    notifyContacts: boolean
    triggerAfterDays: number
    instructions: string
  }
}

interface VaultDetailProps {
  vault: Vault
  items: VaultItem[]
  onBack: () => void
  onEdit: () => void
  onUpload: (files: File[]) => void
  onDownloadItem: (itemId: string) => void
  onDeleteItem: (itemId: string) => void
}

export function VaultDetail({ 
  vault, 
  items, 
  onUpload, 
  onDownloadItem, 
  onDeleteItem 
}: VaultDetailProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isItemFormOpen, setIsItemFormOpen] = useState(false)
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<VaultItem | null>(null)
  const [viewingItem, setViewingItem] = useState<VaultItem | null>(null)

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'password': return <Key className="h-5 w-5" />
      case 'note': return <StickyNote className="h-5 w-5" />
      case 'crypto': return <Bitcoin className="h-5 w-5" />
      case 'document': return <FileText className="h-5 w-5" />
      case 'image': return <ImageIcon className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'legal': return <Scale className="h-5 w-5" />
      case 'assets': return <Package className="h-5 w-5" />
      case 'bank': return <FileText className="h-5 w-5" />
      default: return <Archive className="h-5 w-5" />
    }
  }

  const getItemColor = (type: string) => {
    switch (type) {
      case 'password': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'note': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'crypto': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'document': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'image': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'video': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'legal': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      case 'assets': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
      case 'bank': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }


  const handleAddItem = () => {
    setSelectedItemForEdit(null)
    setIsItemFormOpen(true)
  }

  const handleEditItem = (item: VaultItem) => {
    setSelectedItemForEdit(item)
    setIsItemFormOpen(true)
    setViewingItem(null)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveItem = async (itemData: VaultItem) => {
    try {
      // Convert VaultItem to File[] format expected by onUpload
      // This is a placeholder - in a real implementation, you'd convert the VaultItem data
      const files: File[] = [] // Placeholder conversion
      await onUpload(files)
      setIsItemFormOpen(false)
      setSelectedItemForEdit(null)
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Failed to save item. Please try again.')
    }
  }

  const handleViewItem = (item: VaultItem) => {
    setViewingItem(item)
  }

  const handleDeleteItemConfirm = (itemId: string) => {
    onDeleteItem(itemId)
    setViewingItem(null)
  }



  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <FolderOpen className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No items found</h3>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            {searchTerm ? 'Try adjusting your search.' : 'Add your first item to get started.'}
          </p>
          <Button className="rounded-lg" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleViewItem(item)}
              className="flex items-center p-4 bg-background-card border rounded-xl hover:border-primary/50 transition-all group cursor-pointer"
              style={{ borderColor: '#232629' }}
            >
              {/* Icon Container - Shows item type icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${getItemColor(item.type)}`}>
                {getItemIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold truncate">{item.title}</h3>
                  {item.isEncrypted && (
                    <div className="px-1.5 py-0.5 rounded bg-yellow-500/20 flex items-center">
                      <Lock className="h-3 w-3 text-yellow-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <p className="text-sm text-muted-foreground">Size: {formatFileSize(item.metadata.fileSizeBytes || 0)}</p>
                  <span>•</span>
                  <p className="text-xs text-muted-foreground">Created: {new Date(item.createdAt || '').toLocaleDateString()}</p>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (item.id) onDownloadItem(item.id)
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (item.id) onDeleteItem(item.id)
                  }}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Form Modal */}
      <ItemForm
        isOpen={isItemFormOpen}
        onClose={() => {
          setIsItemFormOpen(false)
          setSelectedItemForEdit(null)
        }}
        onSave={handleSaveItem}
        initialData={selectedItemForEdit || undefined}
        vaultId={vault.id}
        vaultCategory={vault.category}
      />

      {/* Item Details Modal */}
      <ItemDetails
        item={viewingItem}
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        onDownload={() => viewingItem?.id && onDownloadItem(viewingItem.id)}
        onEdit={() => viewingItem && handleEditItem(viewingItem)}
        onDelete={() => viewingItem?.id && handleDeleteItemConfirm(viewingItem.id)}
      />
    </div>
  )
}
