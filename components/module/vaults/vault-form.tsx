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
  category: 'share' | 'delete' | 'pro'
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
    category: initialData?.category || 'share',
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
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>{initialData ? 'Edit Vault' : 'Create New Vault'}</span>
        </CardTitle>
        <CardDescription className="text-sm">
          {initialData ? 'Update your vault settings and preferences.' : 'Create a secure vault to store your digital assets.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Basic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Basic Information</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm sm:text-base">Vault Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter vault name"
                  className="text-sm sm:text-base h-11 sm:h-12 mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this vault contains"
                  className="text-sm sm:text-base h-11 sm:h-12 mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm sm:text-base">Vault Category *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: 'share', label: 'Share After Death', shortLabel: 'Share', icon: Share2, isPro: false },
                { value: 'delete', label: 'Delete After Death', shortLabel: 'Delete', icon: Trash2, isPro: false },
                { value: 'pro', label: 'Sign Off (Pro)', shortLabel: 'Sign Off', icon: Lock, isPro: true }
              ].map((category) => {
                const isDisabled = category.isPro && !isProUser
                return (
                  <Button
                    key={category.value}
                    type="button"
                    variant={formData.category === category.value ? 'default' : 'outline'}
                    onClick={() => !isDisabled && setFormData(prev => ({ ...prev, category: category.value as VaultFormData['category'] }))}
                    className="flex items-center justify-center gap-2 h-12 sm:h-11 text-sm sm:text-base"
                    disabled={isDisabled}
                    title={isDisabled ? 'Upgrade to Pro to use this vault type' : ''}
                  >
                    <category.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.shortLabel}</span>
                  </Button>
                )
              })}
            </div>
            {!isProUser && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Upgrade to Pro to unlock Sign Off vault type
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-12 sm:h-11">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto h-12 sm:h-11">
              {initialData ? 'Update Vault' : 'Create Vault'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
