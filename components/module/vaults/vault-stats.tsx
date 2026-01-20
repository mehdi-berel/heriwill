"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FolderOpen, 
  Lock, 
  Share2, 
  Shield, 
  Archive,
  Star,
  TrendingUp,
  AlertTriangle,
  Trash2
} from "lucide-react"

interface VaultStats {
  totalVaults: number
  encryptedVaults: number
  sharedVaults: number
  favoriteVaults: number
  totalItems: number
  recentlyAccessed: number
  vaultsByCategory: {
    share_after_death: number
    delete_after_death: number
    sign_off_after_death: number
  }
  securityScore: number
  storageUsed: number
  storageLimit: number
}

interface VaultStatsProps {
  stats: VaultStats
}

export function VaultStats({ stats }: VaultStatsProps) {
  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100
  const encryptionRate = stats.totalVaults > 0 ? (stats.encryptedVaults / stats.totalVaults) * 100 : 0

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-green-600" }
    if (score >= 60) return { level: "Good", color: "text-blue-600" }
    if (score >= 40) return { level: "Fair", color: "text-yellow-600" }
    return { level: "Poor", color: "text-red-600" }
  }

  const getStorageLevel = (percentage: number) => {
    if (percentage >= 90) return { level: "Critical", color: "text-red-600" }
    if (percentage >= 75) return { level: "Warning", color: "text-yellow-600" }
    return { level: "Normal", color: "text-green-600" }
  }

  const securityLevel = getSecurityLevel(stats.securityScore)
  const storageLevel = getStorageLevel(storagePercentage)

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vaults</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVaults}</div>
            <p className="text-xs text-muted-foreground">
              Active vaults
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encrypted</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.encryptedVaults}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(encryptionRate)}% encryption rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all vaults
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${securityLevel.color}`}>
              {stats.securityScore}
            </div>
            <p className="text-xs text-muted-foreground">
              {securityLevel.level} security
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
