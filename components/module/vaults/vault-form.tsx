"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  FolderOpen, 
  Shield, 
  Lock, 
  Share2, 
  Trash2,
  Archive,
  Key
} from "lucide-react"

interface VaultFormData {
  name: string
  description: string
  category: 'share_after_death' | 'delete_after_death' | 'sign_off_after_death'
  is_encrypted: boolean
  is_favorite: boolean
  tags: string[]
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

interface VaultFormProps {
  onSubmit: (data: VaultFormData) => void
  onCancel: () => void
  initialData?: Partial<VaultFormData>
}

export function VaultForm({ onSubmit, onCancel, initialData }: VaultFormProps) {
  const [formData, setFormData] = useState<VaultFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'share_after_death',
    is_encrypted: initialData?.is_encrypted || false,
    is_favorite: initialData?.is_favorite || false,
    tags: initialData?.tags || [],
    access_control: {
      allowedHeirs: initialData?.access_control?.allowedHeirs || [],
      requireApproval: initialData?.access_control?.requireApproval || true
    },
    death_settings: {
      notifyContacts: initialData?.death_settings?.notifyContacts || true,
      triggerAfterDays: initialData?.death_settings?.triggerAfterDays || 30,
      instructions: initialData?.death_settings?.instructions || ''
    }
  })

  const [newTag, setNewTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'share_after_death': return <Share2 className="h-4 w-4" />
      case 'delete_after_death': return <Trash2 className="h-4 w-4" />
      case 'sign_off_after_death': return <Lock className="h-4 w-4" />
      default: return <FolderOpen className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'share_after_death': return 'bg-blue-100 text-blue-800'
      case 'delete_after_death': return 'bg-red-100 text-red-800'
      case 'sign_off_after_death': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5" />
          <span>{initialData ? 'Edit Vault' : 'Create New Vault'}</span>
        </CardTitle>
        <CardDescription>
          {initialData ? 'Update your vault settings and preferences.' : 'Create a secure vault to store your digital assets.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Vault Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter vault name"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this vault contains"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <Label>Vault Category</Label>
            <div className="flex gap-2 mt-2">
              {[
                { value: 'share_after_death', label: 'Share After Death', icon: Share2 },
                { value: 'delete_after_death', label: 'Delete After Death', icon: Trash2 },
                { value: 'sign_off_after_death', label: 'Sign Off After Death', icon: Lock }
              ].map((category) => (
                <Button
                  key={category.value}
                  type="button"
                  variant={formData.category === category.value ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, category: category.value as any }))}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-xs hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Settings</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_encrypted"
                  checked={formData.is_encrypted}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_encrypted: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_encrypted">Encrypt this vault</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_favorite"
                  checked={formData.is_favorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_favorite">Mark as favorite</Label>
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Access Control</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={formData.access_control.requireApproval}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    access_control: { ...prev.access_control, requireApproval: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="requireApproval">Require approval for access</Label>
              </div>
            </div>
          </div>

          {/* Death Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Archive className="h-5 w-5" />
              <span>Death Settings</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifyContacts"
                  checked={formData.death_settings.notifyContacts}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    death_settings: { ...prev.death_settings, notifyContacts: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="notifyContacts">Notify contacts on activation</Label>
              </div>
              <div>
                <Label htmlFor="triggerAfterDays">Trigger after days</Label>
                <Input
                  id="triggerAfterDays"
                  type="number"
                  value={formData.death_settings.triggerAfterDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    death_settings: { ...prev.death_settings, triggerAfterDays: parseInt(e.target.value) || 30 }
                  }))}
                  min="1"
                  max="365"
                />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Input
                  id="instructions"
                  value={formData.death_settings.instructions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    death_settings: { ...prev.death_settings, instructions: e.target.value }
                  }))}
                  placeholder="Special instructions for this vault"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2">
            <Button type="submit">
              {initialData ? 'Update Vault' : 'Create Vault'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
