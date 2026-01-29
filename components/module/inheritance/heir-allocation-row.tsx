"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Trash2, ChevronDown, ChevronUp, Eye, Download, Edit } from "lucide-react"

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

interface HeirAllocationRowProps {
  heir: Heir
  allocation: VaultAllocation
  onUpdate: (allocation: VaultAllocation) => void
  onRemove: () => void
}

export function HeirAllocationRow({
  heir,
  allocation,
  onUpdate,
  onRemove
}: HeirAllocationRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [localAllocation, setLocalAllocation] = useState(allocation)

  const handleSave = () => {
    onUpdate(localAllocation)
    setExpanded(false)
  }

  const handleCancel = () => {
    setLocalAllocation(allocation)
    setExpanded(false)
  }

  return (
    <div className="border rounded-lg bg-background-card" style={{ borderColor: '#232629' }}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-primary-600/10 rounded-full">
            <User className="h-4 w-4 text-primary-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-text-primary">
                {heir.full_name_encrypted || 'Unnamed Heir'}
              </p>
              {heir.invitation_status === 'accepted' && (
                <Badge variant="default" className="text-xs">
                  Accepted
                </Badge>
              )}
              {heir.invitation_status === 'pending' && (
                <Badge variant="secondary" className="text-xs bg-status-warning/10 text-status-warning">
                  Pending
                </Badge>
              )}
              {heir.invitation_status === 'rejected' && (
                <Badge variant="secondary" className="text-xs bg-status-error/10 text-status-error">
                  Rejected
                </Badge>
              )}
              {heir.has_accepted && (
                <Badge variant="default" className="text-xs bg-status-success/90 text-white">
                  Verified
                </Badge>
              )}
              {heir.is_active === false && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>{heir.relationship || 'No relationship'}</span>
              {allocation.percentage !== undefined && allocation.percentage > 0 && (
                <>
                  <span>•</span>
                  <span className="font-medium text-primary-400">{allocation.percentage}%</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allocation.can_view && (
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Badge>
          )}
          {allocation.can_export && (
            <Badge variant="outline" className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Badge>
          )}
          {allocation.can_edit && (
            <Badge variant="outline" className="text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Badge>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="text-status-error hover:text-status-error hover:bg-status-error/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t p-4 space-y-4 bg-background-elevated" style={{ borderColor: '#232629' }}>
          <div className="grid gap-4">
            <div>
              <Label htmlFor={`percentage-${heir.id}`} className="text-sm font-medium">
                Inheritance Percentage
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id={`percentage-${heir.id}`}
                  type="number"
                  min="0"
                  max="100"
                  value={localAllocation.percentage || 0}
                  onChange={(e) => setLocalAllocation({
                    ...localAllocation,
                    percentage: parseInt(e.target.value) || 0
                  })}
                  className="w-24"
                />
                <span className="text-sm text-text-muted">%</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Permissions</Label>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-text-muted" />
                  <span className="text-sm">Can View</span>
                </div>
                <Switch
                  checked={localAllocation.can_view}
                  onCheckedChange={(checked) => setLocalAllocation({
                    ...localAllocation,
                    can_view: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-text-muted" />
                  <span className="text-sm">Can Export</span>
                </div>
                <Switch
                  checked={localAllocation.can_export}
                  onCheckedChange={(checked) => setLocalAllocation({
                    ...localAllocation,
                    can_export: checked
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-text-muted" />
                  <span className="text-sm">Can Edit</span>
                </div>
                <Switch
                  checked={localAllocation.can_edit}
                  onCheckedChange={(checked) => setLocalAllocation({
                    ...localAllocation,
                    can_edit: checked
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
