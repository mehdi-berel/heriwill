"use client"

import { useState } from "react"
import { ItemForm } from "./item-form"
import { ItemDetails } from "./item-details"
import { ItemList } from "./item-list"
import type { VaultItem } from "./item-list"

interface Vault {
  id: string
  name: string
  description: string
  category: 'share' | 'delete' | 'pro'
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
  const [isItemFormOpen, setIsItemFormOpen] = useState(false)
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<VaultItem | null>(null)
  const [viewingItem, setViewingItem] = useState<VaultItem | null>(null)

  const handleAddItem = () => {
    setSelectedItemForEdit(null)
    setIsItemFormOpen(true)
  }

  const handleEditItem = (item: VaultItem) => {
    setSelectedItemForEdit(item)
    setIsItemFormOpen(true)
    setViewingItem(null)
  }

  const handleSaveItem = async (itemData: VaultItem) => {
    try {
      // Call the parent's onUpload with the item data
      // The parent component will handle the actual save logic
      await onUpload(itemData as unknown as File[])
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
      {/* Items List using ItemList component */}
      <ItemList
        items={items}
        onItemSelect={handleViewItem}
        onAddItem={handleAddItem}
        showAddButton={true}
        emptyMessage="Add your first item to get started."
      />

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
