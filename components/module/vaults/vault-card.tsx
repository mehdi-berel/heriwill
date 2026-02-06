"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  FolderOpen, 
  Share2, 
  Trash2,
  Shield,
  Edit,
  ChevronRight,
  Lock
} from "lucide-react"

export type VaultCategory = 'share' | 'delete' | 'pro'

export interface Vault {
  id: string
  user_id: string
  name: string
  description: string | null
  category: VaultCategory
  is_locked: boolean | null
  is_shared: boolean | null
  item_count: number
  created_at: string
  updated_at: string
  last_accessed: string | null
  icon: string | null
  color: string | null
  settings: Record<string, unknown> | null
  access_control: Record<string, unknown> | null
  death_settings: Record<string, unknown> | null
  sort_order: number | null
}

interface VaultCardProps {
  vault: Vault
  onPress: () => void
  onEdit?: (vault: Vault) => void
  onDelete?: (vaultId: string) => void
  onManageHeirs?: (vault: Vault) => void
  heirCount?: number
  isSelected?: boolean
}

const categoryIcons: Record<VaultCategory, typeof Share2> = {
  delete: Trash2,
  share: Share2,
  pro: Shield,
}

const categoryLabels: Record<VaultCategory, string> = {
  delete: 'Delete After Death',
  share: 'Share After Death',
  pro: 'Secure After Death',
}

export function VaultCard({ 
  vault, 
  onPress, 
  onEdit, 
  onDelete,
  onManageHeirs,
  heirCount = 0,
  isSelected = false 
}: VaultCardProps) {
  const router = useRouter()
  const CategoryIcon = categoryIcons[vault.category] || FolderOpen
  const itemCount = vault.item_count || 0
  const label = vault.name || categoryLabels[vault.category] || 'Vault'
  const isLocked = vault.is_locked === true

  return (
    <div
      onClick={isLocked ? () => router.push('/settings?tab=subscription') : onPress}
      className={`relative flex items-center p-4 bg-background-card border rounded-xl transition-all group cursor-pointer ${
        isSelected ? 'border-primary bg-primary/5' : ''
      } ${
        isLocked ? 'opacity-60 hover:opacity-80' : 'hover:border-primary/50'
      }`}
      style={{ borderColor: isSelected ? undefined : '#232629' }}
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Upgrade to unlock</span>
          </div>
        </div>
      )}
      {/* Icon Container */}
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
        style={{ backgroundColor: vault.color || 'rgb(124, 58, 237)' }}
      >
        <CategoryIcon className="h-6 w-6 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-base font-semibold truncate">{label}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <FolderOpen className="h-3.5 w-3.5" />
          <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          {heirCount > 0 && (
            <>
              <span>•</span>
              <Share2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary font-medium">{heirCount} heir{heirCount > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-2">
        {onManageHeirs && (
          <Button
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onManageHeirs(vault)
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        {!isLocked && onEdit && (
          <Button
            size="sm"
            variant="ghost"
            className="hidden sm:flex h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(vault)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {!isLocked && onDelete && (
          <Button
            size="sm"
            variant="ghost"
            className="hidden sm:flex h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(vault.id)
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
        {!isLocked && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
      </div>
    </div>
  )
}
