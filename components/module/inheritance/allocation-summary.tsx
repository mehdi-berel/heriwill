"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Shield, AlertCircle, CheckCircle } from "lucide-react"

interface Heir {
  id: string
  full_name_encrypted: string | null
  relationship: string | null
}

interface Vault {
  id: string
  name: string
}

interface VaultAllocation {
  vault_id: string
  heir_id: string
  percentage?: number
}

interface AllocationSummaryProps {
  heirs: Heir[]
  vaults: Vault[]
  allocations: VaultAllocation[]
}

export function AllocationSummary({ heirs, vaults, allocations }: AllocationSummaryProps) {
  const totalAllocations = allocations.length
  const heirsWithAllocations = new Set(allocations.map(a => a.heir_id)).size
  const vaultsWithAllocations = new Set(allocations.map(a => a.vault_id)).size
  const unallocatedHeirs = heirs.length - heirsWithAllocations
  const unallocatedVaults = vaults.length - vaultsWithAllocations

  const allocationPercentage = vaults.length > 0 
    ? Math.round((vaultsWithAllocations / vaults.length) * 100)
    : 0

  const getHeirAllocations = (heirId: string) => {
    return allocations.filter(a => a.heir_id === heirId)
  }

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Allocations</p>
                <p className="text-2xl font-bold text-text-primary">{totalAllocations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Heirs Assigned</p>
                <p className="text-2xl font-bold text-text-primary">
                  {heirsWithAllocations}/{heirs.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-status-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Vaults Allocated</p>
                <p className="text-2xl font-bold text-text-primary">
                  {vaultsWithAllocations}/{vaults.length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-primary-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Completion</p>
                <p className="text-2xl font-bold text-text-primary">{allocationPercentage}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-600/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-400">{allocationPercentage}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allocation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={allocationPercentage} className="h-2" />
            <p className="text-sm text-text-muted">
              {vaultsWithAllocations} of {vaults.length} vaults have been allocated to heirs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {(unallocatedHeirs > 0 || unallocatedVaults > 0) && (
        <Card className="border-status-warning/30 bg-status-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-status-warning mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-text-primary mb-1">Incomplete Allocations</p>
                <ul className="text-sm text-text-muted space-y-1">
                  {unallocatedHeirs > 0 && (
                    <li>• {unallocatedHeirs} heir{unallocatedHeirs !== 1 ? 's' : ''} without vault access</li>
                  )}
                  {unallocatedVaults > 0 && (
                    <li>• {unallocatedVaults} vault{unallocatedVaults !== 1 ? 's' : ''} not assigned to any heir</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heir Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Heir Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {heirs.map(heir => {
              const heirAllocations = getHeirAllocations(heir.id)
              return (
                <div key={heir.id} className="flex items-center justify-between p-2 rounded-lg bg-background-elevated">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary-600/10 rounded-full">
                      <Users className="h-3 w-3 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {heir.full_name_encrypted || 'Unnamed Heir'}
                      </p>
                      <p className="text-xs text-text-muted">{heir.relationship || 'No relationship'}</p>
                    </div>
                  </div>
                  <Badge variant={heirAllocations.length > 0 ? "default" : "secondary"}>
                    {heirAllocations.length} vault{heirAllocations.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
