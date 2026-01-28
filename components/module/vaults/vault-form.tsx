"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { 
  FolderOpen, 
  Lock, 
  Share2, 
  Trash2
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
}

interface VaultFormProps {
  onSubmit: (data: VaultFormData) => void
  onCancel: () => void
  initialData?: Partial<VaultFormData>
}

export function VaultForm({ onSubmit, onCancel, initialData }: VaultFormProps) {
  const [isProUser, setIsProUser] = useState(false)
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
    }
  })

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()

        setIsProUser((profile as { subscription_tier?: string } | null)?.subscription_tier === 'pro')
      } catch (error) {
        console.error('Error checking pro status:', error)
      }
    }

    checkProStatus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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
                { value: 'share_after_death', label: 'Share After Death', icon: Share2, isPro: false },
                { value: 'delete_after_death', label: 'Delete After Death', icon: Trash2, isPro: false },
                { value: 'sign_off_after_death', label: 'Sign Off After Death (Pro)', icon: Lock, isPro: true }
              ].map((category) => {
                const isDisabled = category.isPro && !isProUser
                return (
                  <Button
                    key={category.value}
                    type="button"
                    variant={formData.category === category.value ? 'default' : 'outline'}
                    onClick={() => !isDisabled && setFormData(prev => ({ ...prev, category: category.value as VaultFormData['category'] }))}
                    className="flex items-center space-x-2"
                    disabled={isDisabled}
                    title={isDisabled ? 'Upgrade to Pro to use this vault type' : ''}
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </Button>
                )
              })}
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
