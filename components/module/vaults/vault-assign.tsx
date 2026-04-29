"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"

interface Heir {
  id: string
  full_name: string
  email: string
  relationship: string | null
  invitation_status: string
  access_level: 'full' | 'partial' | 'view'
}

interface VaultAssignProps {
  vaultId: string
  vaultName: string
  vaultCategory?: 'share' | 'delete'
  assignedHeirIds: string[]
  onAssignHeirs: (heirIds: string[]) => void
  onClose?: () => void
}

export function VaultAssign({ 
  vaultName,
  vaultCategory = 'share',
  assignedHeirIds, 
  onAssignHeirs,
  onClose 
}: VaultAssignProps) {
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [selectedHeirIds, setSelectedHeirIds] = useState<string[]>(assignedHeirIds)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const loadHeirs = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Load heirs from Supabase
      const { data, error } = await supabase
        .from('heirs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error loading heirs', error)
        setHeirs([])
      } else {
        // Map database fields to component interface
        const mappedHeirs: Heir[] = (data || []).map((heir: unknown) => {
          const h = heir as { id: string; name: string | null; email: string | null; relationship: string | null; invitation_status?: string | null; access_level?: string | null }
          return {
            id: h.id,
            full_name: h.name || 'Unknown',
            email: h.email || '',
            relationship: h.relationship || 'Unknown',
            invitation_status: h.invitation_status || 'pending',
            access_level: (h.access_level as 'full' | 'partial' | 'view') || 'view'
          }
        })
        setHeirs(mappedHeirs)
      }
      setLoading(false)
    } catch (error) {
      logger.error('Error loading data', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initializeData = async () => {
      await loadHeirs()
    }
    initializeData()
  }, [loadHeirs])

  const filteredHeirs = heirs.filter(heir =>
    heir.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    heir.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    heir.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleHeirSelection = (heirId: string) => {
    setSelectedHeirIds(prev =>
      prev.includes(heirId)
        ? prev.filter(id => id !== heirId)
        : [...prev, heirId]
    )
  }

  const handleSave = () => {
    onAssignHeirs(selectedHeirIds)
    onClose?.()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-success/20 text-success'
      case 'pending': return 'bg-warning/20 text-warning'
      case 'rejected': return 'bg-error/20 text-error'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading heirs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Assign Heirs to Vault</h2>
        <p className="text-muted-foreground">
          Select which heirs should have access to <span className="font-semibold">{vaultName}</span>
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search heirs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Heirs List */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Available Heirs</CardTitle>
          <CardDescription>
            Select heirs to grant access to this vault
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredHeirs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">No heirs found</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                {searchTerm ? 'Try adjusting your search.' : 'Add heirs first to assign them to vaults.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHeirs.map((heir) => (
                <div
                  key={heir.id}
                  className="flex items-center p-4 bg-background-card border rounded-xl hover:border-primary/50 transition-all cursor-pointer"
                  style={{ borderColor: '#232629' }}
                  onClick={() => toggleHeirSelection(heir.id)}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedHeirIds.includes(heir.id)}
                    onCheckedChange={() => toggleHeirSelection(heir.id)}
                    className="mr-4"
                  />

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold truncate">{heir.full_name}</h3>
                      <Badge className={getStatusColor(heir.invitation_status)}>
                        {heir.invitation_status}
                      </Badge>
                    </div>
                    
                    {heir.relationship && (
                      <div className="text-sm text-muted-foreground mb-1">
                        {heir.relationship}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="truncate">{heir.email}</span>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        {heir.access_level} access
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave}>
          Save Assignment ({selectedHeirIds.length} heirs)
        </Button>
      </div>
    </div>
  )
}
