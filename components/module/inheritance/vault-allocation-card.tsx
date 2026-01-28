"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Users, Plus, Trash2, Edit, Shield } from "lucide-react"
import { HeirAllocationRow } from "./heir-allocation-row"

interface Vault {
  id: string
  name: string
  description: string | null
  category: string
  item_count?: number
}

interface Heir {
  id: string
  full_name_encrypted: string | null
  email_encrypted: string | null
  relationship: string | null
  access_level: 'full' | 'partial' | 'view'
  is_active: boolean | null
  invitation_status: string | null
  has_accepted: boolean | null
}

interface VaultAllocation {
  heir_id: string
  can_view: boolean
  can_export: boolean
  can_edit: boolean
  percentage?: number
}

interface VaultAllocationCardProps {
  vault: Vault
  heirs: Heir[]
  allocations: VaultAllocation[]
  onAddHeir: (vaultId: string) => void
  onUpdateAllocation: (vaultId: string, heirId: string, allocation: VaultAllocation) => void
  onRemoveAllocation: (vaultId: string, heirId: string) => void
}

export function VaultAllocationCard({
  vault,
  heirs,
  allocations,
  onAddHeir,
  onUpdateAllocation,
  onRemoveAllocation
}: VaultAllocationCardProps) {
  const [expanded, setExpanded] = useState(false)

  const allocatedHeirs = heirs.filter(h => 
    allocations.some(a => a.heir_id === h.id)
  )

  const unallocatedHeirs = heirs.filter(h => 
    !allocations.some(a => a.heir_id === h.id)
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'share_after_death':
        return 'bg-primary-600/10 text-primary-400 border-primary-600/30'
      case 'delete_after_death':
        return 'bg-status-error/10 text-status-error border-status-error/30'
      case 'sign_off_after_death':
        return 'bg-status-warning/10 text-status-warning border-status-warning/30'
      default:
        return 'bg-background-elevated text-text-muted border-border-default'
    }
  }

  return (
    <Card className="border-border-default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-text-primary">{vault.name}</CardTitle>
              <CardDescription className="text-text-muted">
                {vault.description || 'No description'} • {vault.item_count || 0} items
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getCategoryColor(vault.category)}>
              {vault.category.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="secondary">
              {allocatedHeirs.length} heir{allocatedHeirs.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {allocatedHeirs.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border-default rounded-lg">
            <Shield className="h-8 w-8 mx-auto mb-2 text-text-muted" />
            <p className="text-sm text-text-muted mb-3">No heirs assigned to this vault</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setExpanded(!expanded)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Heirs
            </Button>
          </div>
        ) : (
          <>
            {allocatedHeirs.map(heir => {
              const allocation = allocations.find(a => a.heir_id === heir.id)!
              return (
                <HeirAllocationRow
                  key={heir.id}
                  heir={heir}
                  allocation={allocation}
                  onUpdate={(updated) => onUpdateAllocation(vault.id, heir.id, updated)}
                  onRemove={() => onRemoveAllocation(vault.id, heir.id)}
                />
              )
            })}
            
            {unallocatedHeirs.length > 0 && (
              <Button 
                size="sm" 
                variant="ghost"
                className="w-full"
                onClick={() => setExpanded(!expanded)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More Heirs ({unallocatedHeirs.length} available)
              </Button>
            )}
          </>
        )}

        {expanded && unallocatedHeirs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border-default space-y-2">
            <p className="text-sm font-medium text-text-secondary mb-2">Available Heirs:</p>
            {unallocatedHeirs.map(heir => (
              <div 
                key={heir.id}
                className="flex items-center justify-between p-3 border border-border-default rounded-lg bg-background-elevated hover:bg-background-hover transition-colors cursor-pointer"
                onClick={() => {
                  onUpdateAllocation(vault.id, heir.id, {
                    heir_id: heir.id,
                    can_view: true,
                    can_export: false,
                    can_edit: false,
                    percentage: 0
                  })
                  setExpanded(false)
                }}
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {heir.full_name_encrypted || 'Unnamed Heir'}
                  </p>
                  <p className="text-sm text-text-muted">
                    {heir.relationship || 'No relationship'} • {heir.access_level}
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
