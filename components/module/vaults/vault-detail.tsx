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
  Image,
  Video,
  Archive,
  Key,
  Shield,
  Search,
  Plus
} from "lucide-react"
import { ItemForm } from "./item-form"
import { ItemDetails } from "./item-details"

interface VaultItem {
  id: string
  name: string
  type: 'password' | 'document' | 'video' | 'image' | 'note' | 'crypto' | 'bank' | 'other'
  size: number
  created_at: string
  updated_at: string
  is_encrypted: boolean
  tags: string[]
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
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'password': return <Key className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" aria-label="Image" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'crypto': return <Shield className="h-4 w-4" />
      case 'bank': return <FileText className="h-4 w-4" />
      default: return <Archive className="h-4 w-4" />
    }
  }

  const getItemColor = (type: string) => {
    switch (type) {
      case 'password': return 'bg-yellow-100 text-yellow-800'
      case 'document': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-purple-100 text-purple-800'
      case 'image': return 'bg-green-100 text-green-800'
      case 'note': return 'bg-gray-100 text-gray-800'
      case 'crypto': return 'bg-orange-100 text-orange-800'
      case 'bank': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const handleSaveItem = async (itemData: any) => {
    try {
      // Convert VaultItem to the format expected by onUpload
      // This is a placeholder - adjust based on actual onUpload requirements
      await onUpload(itemData)
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
              className="flex items-center p-4 bg-background-card border border-border rounded-xl hover:border-primary/50 transition-all group cursor-pointer"
            >
              {/* Icon Container */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${getItemColor(item.type)}`}>
                {getItemIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  {item.is_encrypted && (
                    <div className="px-1.5 py-0.5 rounded bg-yellow-500/20 flex items-center">
                      <Lock className="h-3 w-3 text-yellow-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>{formatFileSize(item.size)}</span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
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
                  onClick={() => onDownloadItem(item.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0"
                  onClick={() => onDeleteItem(item.id)}
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
        initialData={selectedItemForEdit ? {
          id: selectedItemForEdit.id,
          title: selectedItemForEdit.name,
          type: selectedItemForEdit.type,
          metadata: {},
          isEncrypted: selectedItemForEdit.is_encrypted,
          tags: selectedItemForEdit.tags,
          createdAt: selectedItemForEdit.created_at,
          updatedAt: selectedItemForEdit.updated_at
        } : undefined}
        vaultId={vault.id}
        vaultCategory={vault.category}
      />

      {/* Item Details Modal */}
      <ItemDetails
        item={viewingItem ? {
          id: viewingItem.id,
          title: viewingItem.name,
          type: viewingItem.type,
          metadata: {},
          isEncrypted: viewingItem.is_encrypted,
          tags: viewingItem.tags,
          createdAt: viewingItem.created_at,
          updatedAt: viewingItem.updated_at
        } : null}
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        onEdit={() => viewingItem && handleEditItem(viewingItem)}
        onDelete={() => viewingItem && handleDeleteItemConfirm(viewingItem.id)}
      />
    </div>
  )
}
