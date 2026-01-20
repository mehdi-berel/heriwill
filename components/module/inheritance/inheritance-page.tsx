"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, FileText, Users, Shield, Archive, ArrowRight, Plus } from "lucide-react"
import { InheritanceList } from "./inheritance-list"
import { supabase } from "@/lib/supabase"

interface Heir {
  id: string
  name: string
  email: string
  phone?: string
  relationship: string
  percentage: number
  status: 'pending' | 'accepted' | 'verified' | 'rejected'
  inheritedAssets: any[]
  inheritedVaults: any[]
  totalValue: number
  lastContact?: string
  createdAt: string
}

interface InheritancePageProps {
  userId: string
}

export function InheritancePage({ userId }: InheritancePageProps) {
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHeir, setSelectedHeir] = useState<Heir | null>(null)
  const [showHeirDetails, setShowHeirDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for demonstration
  const mockHeirs: Heir[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123-4567',
      relationship: 'Son',
      percentage: 40,
      status: 'accepted',
      inheritedAssets: [
        { id: '1', name: 'Family Home', type: 'real_estate', value: 500000, description: 'Primary residence in California' },
        { id: '2', name: 'Investment Portfolio', type: 'financial', value: 250000, description: 'Stocks and bonds' },
        { id: '3', name: 'Family Car', type: 'vehicle', value: 35000, description: '2022 Toyota Camry' }
      ],
      inheritedVaults: [
        { id: '1', name: 'Family Documents', itemCount: 15, isShared: false, lastAccessed: '2024-01-15' },
        { id: '2', name: 'Personal Photos', itemCount: 500, isShared: true, lastAccessed: '2024-01-20' }
      ],
      totalValue: 785000,
      lastContact: '2024-01-20',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0123-4568',
      relationship: 'Daughter',
      percentage: 35,
      status: 'verified',
      inheritedAssets: [
        { id: '4', name: 'Vacation Property', type: 'real_estate', value: 300000, description: 'Beach house in Florida' },
        { id: '5', name: 'Jewelry Collection', type: 'personal', value: 75000, description: 'Family heirlooms' }
      ],
      inheritedVaults: [
        { id: '3', name: 'Legal Documents', itemCount: 8, isShared: false, lastAccessed: '2024-01-18' }
      ],
      totalValue: 375000,
      lastContact: '2024-01-18',
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      'name': 'Michael Johnson',
      email: 'michael.johnson@example.com',
      phone: '+1-555-0123-4569',
      relationship: 'Spouse',
      percentage: 25,
      status: 'pending',
      inheritedAssets: [
        { id: '6', name: 'Business Assets', type: 'business', value: 200000, description: 'Company shares and equipment' }
      ],
      inheritedVaults: [
        { id: '4', name: 'Business Records', itemCount: 25, isShared: true, lastAccessed: '2024-01-10' }
      ],
      totalValue: 200000,
      lastContact: '2024-01-10',
      createdAt: '2024-01-01'
    }
  ]

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    // For now, using mock data
    setHeirs(mockHeirs)
    setLoading(false)
  }, [userId])

  const handleHeirSelect = (heir: Heir) => {
    setSelectedHeir(heir)
    setShowHeirDetails(true)
  }

  const handleHeirEdit = (heir: Heir) => {
    // In a real app, this would open an edit form
    console.log('Edit heir:', heir)
  }

  const handleHeirDelete = (heirId: string) => {
    // In a real app, this would delete the heir
    console.log('Delete heir:', heirId)
    setHeirs(prev => prev.filter(h => h.id !== heirId))
  }

  const handleBack = () => {
    setShowHeirDetails(false)
    setSelectedHeir(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading inheritance plan...</div>
      </div>
    )
  }

  if (showHeirDetails && selectedHeir) {
    // Show heir details view
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            ← Back to Heirs
          </Button>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{selectedHeir.name}</h1>
              <p className="text-muted-foreground">
                {selectedHeir.relationship} • {selectedHeir.percentage}% inheritance
              </p>
            </div>
          </div>
        </div>

        {/* Heir Inheritance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Inheritance Summary</CardTitle>
            <CardDescription>
              What {selectedHeir.name} will inherit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Value */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Total Inheritance Value</span>
              <span className="text-2xl font-bold text-green-600">
                ${selectedHeir.totalValue.toLocaleString()}
              </span>
            </div>

            {/* Assets Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Assets</h3>
              <div className="space-y-3">
                {selectedHeir.inheritedAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Archive className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${asset.value.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {asset.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vaults Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vaults</h3>
              <div className="space-y-3">
                {selectedHeir.inheritedVaults.map((vault) => (
                  <div key={vault.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${vault.isShared ? 'bg-purple-100' : 'bg-gray-100'} rounded-lg`}>
                        <Shield className={`h-4 w-4 ${vault.isShared ? 'text-purple-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{vault.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {vault.itemCount} items • {vault.isShared ? 'Shared' : 'Private'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {vault.lastAccessed && (
                        <p className="text-xs text-muted-foreground">
                          Last: {new Date(vault.lastAccessed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm">{selectedHeir.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm">{selectedHeir.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Relationship</p>
                <p className="text-sm">{selectedHeir.relationship}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Contact</p>
                <p className="text-sm">
                  {selectedHeir.lastContact ? new Date(selectedHeir.lastContact).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleBack}>
            Back to Heirs
          </Button>
          <Button>
            Edit Heir Details
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inheritance Distribution</h1>
        <p className="text-muted-foreground">
          See exactly what each heir will inherit from your estate
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Heirs</p>
                <p className="text-2xl font-bold">{heirs.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ${heirs.reduce((sum, heir) => sum + heir.totalValue, 0).toLocaleString()}
                </p>
              </div>
              <Archive className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">
                  {heirs.filter(h => h.status === 'accepted' || h.status === 'verified').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {heirs.filter(h => h.status === 'pending').length}
                </p>
              </div>
              <Circle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heirs List */}
      <InheritanceList
        heirs={heirs}
        onHeirSelect={handleHeirSelect}
        onHeirEdit={handleHeirEdit}
        onHeirDelete={handleHeirDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  )
}
