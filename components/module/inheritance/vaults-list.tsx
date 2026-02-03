"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, User, FileText, Calendar } from "lucide-react"

interface InheritedVault {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  category: string
  owner_name: string
  item_count: number
  created_at: string
}

interface VaultsListProps {
  vaults: InheritedVault[]
  onVaultClick: (vaultId: string) => void
}

export function VaultsList({ vaults, onVaultClick }: VaultsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (vaults.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Inherited Vaults</h3>
          <p className="text-muted-foreground">
            You don&apos;t have access to any inherited vaults yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vaults.map((vault) => (
        <Card
          key={vault.id}
          className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
          onClick={() => onVaultClick(vault.id)}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div 
                className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: vault.color || '#8B5CF6' }}
              >
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{vault.name}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">{vault.owner_name}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {vault.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {vault.description}
              </p>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{vault.item_count} items</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {vault.category.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(vault.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
