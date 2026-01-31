"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Search, Scale } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

interface Heir {
  id: string
  full_name: string
  email: string
  relationship: string | null
  invitation_status: string
  access_level: 'full' | 'partial' | 'view'
}

interface Notary {
  id: string
  name: string
  firm_name?: string
  email: string
  phone: string
  specialization?: string
  is_primary: boolean
}

interface VaultAssignProps {
  vaultId: string
  vaultName: string
  vaultCategory?: 'share' | 'delete' | 'pro'
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
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [selectedHeirIds, setSelectedHeirIds] = useState<string[]>(assignedHeirIds)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  const isNotaryMode = vaultCategory === 'pro'

  const loadHeirs = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      if (isNotaryMode) {
        // Load notaries from Supabase
        const { data, error } = await supabase
          .from('notaries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading notaries:', error)
          setNotaries([])
        } else {
          setNotaries(data || [])
        }
      } else {
        // Load heirs from Supabase
        const { data, error } = await supabase
          .from('heirs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading heirs:', error)
          setHeirs([])
        } else {
          // Map database fields to component interface
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedHeirs: Heir[] = (data || []).map((heir: any) => ({
            id: heir.id,
            full_name: heir.full_name_encrypted || 'Unknown',
            email: heir.email_encrypted || '',
            relationship: heir.relationship || 'Unknown',
            invitation_status: heir.invitation_status || 'pending',
            access_level: heir.access_level || 'view'
          }))
          setHeirs(mappedHeirs)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }, [isNotaryMode])

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
  
  const filteredNotaries = notaries.filter(notary =>
    notary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notary.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notary.firm_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-2xl font-bold mb-2">{isNotaryMode ? 'Assign Notary to Vault' : 'Assign Heirs to Vault'}</h2>
        <p className="text-muted-foreground">
          {isNotaryMode 
            ? `Select a notary to witness and certify documents in `
            : `Select which heirs should have access to `}
          <span className="font-semibold">{vaultName}</span>
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isNotaryMode ? "Search notaries..." : "Search heirs..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Heirs/Notaries List */}
      <Card className="border">
        <CardHeader>
          <CardTitle>{isNotaryMode ? 'Available Notaries' : 'Available Heirs'}</CardTitle>
          <CardDescription>
            {isNotaryMode 
              ? 'Select a notary for this vault'
              : 'Select heirs to grant access to this vault'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(isNotaryMode ? filteredNotaries.length === 0 : filteredHeirs.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 px-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                {isNotaryMode ? <Scale className="h-12 w-12 text-primary" /> : <Users className="h-12 w-12 text-primary" />}
              </div>
              <h3 className="text-xl font-bold mb-2">{isNotaryMode ? 'No notaries found' : 'No heirs found'}</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                {searchTerm ? 'Try adjusting your search.' : isNotaryMode ? 'Add notaries first to assign them to vaults.' : 'Add heirs first to assign them to vaults.'}
              </p>
            </div>
          ) : isNotaryMode ? (
            <div className="space-y-3">
              {filteredNotaries.map((notary) => (
                <div
                  key={notary.id}
                  className="flex items-center p-4 bg-background-card border rounded-xl hover:border-primary/50 transition-all cursor-pointer"
                  style={{ borderColor: '#232629' }}
                  onClick={() => toggleHeirSelection(notary.id)}
                >
                  <Checkbox
                    checked={selectedHeirIds.includes(notary.id)}
                    onCheckedChange={() => toggleHeirSelection(notary.id)}
                    className="mr-4"
                  />
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold truncate">{notary.name}</h3>
                      {notary.is_primary && (
                        <Badge className="bg-success/20 text-success">Primary</Badge>
                      )}
                    </div>
                    {notary.firm_name && (
                      <div className="text-sm text-muted-foreground mb-1">
                        {notary.firm_name}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="truncate">{notary.email}</span>
                      {notary.specialization && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {notary.specialization}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
          Save Assignment ({selectedHeirIds.length} {isNotaryMode ? 'notary' : 'heirs'})
        </Button>
      </div>
    </div>
  )
}
