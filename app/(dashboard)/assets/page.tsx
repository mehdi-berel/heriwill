"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/module/dashboard/dashboard-layout"
import { AssetForm } from "@/components/module/assets/asset-form"
import { AssetList } from "@/components/module/assets/asset-list"
import { AssetStats } from "@/components/module/assets/asset-stats"
import { AssetDetail } from "@/components/module/assets/asset-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Asset {
  id: string
  name: string
  type: 'real_estate' | 'vehicle' | 'bank_account' | 'investment' | 'insurance' | 'personal_property' | 'business' | 'other'
  description?: string
  value?: number
  location?: string
  ownership_type: 'sole' | 'joint' | 'tenants_in_common' | 'community_property'
  beneficiaries: string[]
  documents: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export default function AssetsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [viewMode, setViewMode] = useState<'stats' | 'list' | 'add' | 'detail'>('stats')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      
      // Load user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Load assets data
      await loadAssets(user.id)
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth/login")
      } else {
        setUser(session.user)
        loadAssets(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadAssets = async (userId: string) => {
    try {
      // Mock data for now - in real app, fetch from assets table
      const mockAssets: Asset[] = [
        {
          id: '1',
          name: 'Primary Residence',
          type: 'real_estate',
          description: 'Family home with 4 bedrooms, 3 bathrooms, and a large backyard',
          value: 750000,
          location: '123 Main St, Anytown, ST 12345',
          ownership_type: 'joint',
          beneficiaries: ['John Doe', 'Jane Doe'],
          documents: ['Deed', 'Property Tax Records', 'Insurance Policy'],
          notes: 'Purchased in 2015, fully paid off',
          created_at: new Date(Date.now() - 365 * 8 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: '2018 Honda Accord',
          type: 'vehicle',
          description: 'Well-maintained sedan with low mileage',
          value: 25000,
          location: 'Garage at Primary Residence',
          ownership_type: 'sole',
          beneficiaries: ['John Doe'],
          documents: ['Vehicle Title', 'Registration', 'Insurance'],
          notes: 'Regular maintenance performed',
          created_at: new Date(Date.now() - 365 * 6 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          name: 'Chase Checking Account',
          type: 'bank_account',
          description: 'Primary checking account for daily transactions',
          value: 15000,
          location: 'Chase Bank - Downtown Branch',
          ownership_type: 'joint',
          beneficiaries: ['John Doe', 'Jane Doe'],
          documents: ['Account Statements', 'Account Agreement'],
          notes: 'Joint account with spouse',
          created_at: new Date(Date.now() - 365 * 10 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          name: 'Vanguard Index Fund Portfolio',
          type: 'investment',
          description: 'Diversified portfolio of index funds for retirement',
          value: 250000,
          location: 'Vanguard Brokerage Account',
          ownership_type: 'joint',
          beneficiaries: ['John Doe', 'Jane Doe'],
          documents: ['Investment Statements', 'Tax Forms'],
          notes: 'Long-term investment strategy',
          created_at: new Date(Date.now() - 365 * 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          name: 'Term Life Insurance Policy',
          type: 'insurance',
          description: '20-year term life insurance policy',
          value: 500000,
          location: 'State Farm Insurance',
          ownership_type: 'sole',
          beneficiaries: ['Jane Doe'],
          documents: ['Insurance Policy', 'Beneficiary Designation'],
          notes: 'Premium paid annually',
          created_at: new Date(Date.now() - 365 * 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setAssets(mockAssets)
    } catch (error) {
      console.error('Error loading assets:', error)
    }
  }

  const handleAddAsset = async (assetData: any) => {
    try {
      const { data } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          name: assetData.name,
          type: assetData.type,
          description: assetData.description || null,
          value: assetData.value || null,
          location: assetData.location || null,
          ownership_type: assetData.ownership_type,
          beneficiaries: assetData.beneficiaries || [],
          documents: assetData.documents || [],
          notes: assetData.notes || null
        })
        .select()
        .single()

      if (data) {
        setAssets([data, ...assets])
        setViewMode('list')
      }
    } catch (error) {
      console.error('Error adding asset:', error)
    }
  }

  const handleUpdateAsset = async (assetData: any) => {
    if (!selectedAsset) return

    try {
      const { data } = await supabase
        .from('assets')
        .update({
          name: assetData.name,
          type: assetData.type,
          description: assetData.description || null,
          value: assetData.value || null,
          location: assetData.location || null,
          ownership_type: assetData.ownership_type,
          beneficiaries: assetData.beneficiaries || [],
          documents: assetData.documents || [],
          notes: assetData.notes || null
        })
        .eq('id', selectedAsset.id)
        .select()
        .single()

      if (data) {
        setAssets(assets.map(a => a.id === selectedAsset.id ? data : a))
        setSelectedAsset(data)
      }
    } catch (error) {
      console.error('Error updating asset:', error)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)
      
      setAssets(assets.filter(a => a.id !== assetId))
      if (selectedAsset?.id === assetId) {
        setSelectedAsset(null)
        setViewMode('list')
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset)
    setViewMode('detail')
  }

  const handleAssetEdit = (asset: Asset) => {
    setSelectedAsset(asset)
    setViewMode('add')
  }

  const handleUploadDocument = async (files: File[]) => {
    if (!selectedAsset) return

    // In a real app, this would upload files to storage
    console.log('Uploading documents for asset:', selectedAsset.id, files)
    
    // Mock adding documents
    const newDocuments = files.map((file, index) => file.name)
    
    const updatedAsset = {
      ...selectedAsset,
      documents: [...selectedAsset.documents, ...newDocuments]
    }
    
    setSelectedAsset(updatedAsset)
    setAssets(assets.map(a => a.id === selectedAsset.id ? updatedAsset : a))
  }

  const handleDownloadDocument = async (docName: string) => {
    // In a real app, this would download the file
    console.log('Downloading document:', docName)
  }

  const handleDeleteDocument = async (docName: string) => {
    if (!selectedAsset) return

    const updatedAsset = {
      ...selectedAsset,
      documents: selectedAsset.documents.filter(doc => doc !== docName)
    }
    
    setSelectedAsset(updatedAsset)
    setAssets(assets.map(a => a.id === selectedAsset.id ? updatedAsset : a))
  }

  const getAssetStats = () => {
    const totalAssets = assets.length
    const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0)
    const realEstateCount = assets.filter(a => a.type === 'real_estate').length
    const vehicleCount = assets.filter(a => a.type === 'vehicle').length
    const bankAccountCount = assets.filter(a => a.type === 'bank_account').length
    const investmentCount = assets.filter(a => a.type === 'investment').length
    const insuranceCount = assets.filter(a => a.type === 'insurance').length
    const personalPropertyCount = assets.filter(a => a.type === 'personal_property').length
    const businessCount = assets.filter(a => a.type === 'business').length
    const otherCount = assets.filter(a => a.type === 'other').length
    const soleOwnershipCount = assets.filter(a => a.ownership_type === 'sole').length
    const jointOwnershipCount = assets.filter(a => a.ownership_type === 'joint').length
    const withBeneficiariesCount = assets.filter(a => a.beneficiaries.length > 0).length
    const withLocationCount = assets.filter(a => a.location).length
    const withDocumentsCount = assets.filter(a => a.documents.length > 0).length
    const averageValue = totalAssets > 0 ? totalValue / totalAssets : 0

    const highestValueAsset = assets.length > 0 
      ? assets.reduce((max, asset) => (asset.value || 0) > (max.value || 0) ? asset : max)
      : undefined

    return {
      totalAssets,
      totalValue,
      realEstateCount,
      vehicleCount,
      bankAccountCount,
      investmentCount,
      insuranceCount,
      personalPropertyCount,
      businessCount,
      otherCount,
      soleOwnershipCount,
      jointOwnershipCount,
      withBeneficiariesCount,
      withLocationCount,
      withDocumentsCount,
      averageValue,
      highestValueAsset: highestValueAsset && highestValueAsset.value 
        ? {
            name: highestValueAsset.name,
            value: highestValueAsset.value,
            type: highestValueAsset.type
          }
        : undefined
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      userName={profile?.full_name || user?.email} 
      onSignOut={handleSignOut}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Assets</h1>
            <p className="text-muted-foreground">
              Manage your real assets for inheritance planning
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'stats' ? 'default' : 'outline'}
              onClick={() => setViewMode('stats')}
            >
              Stats
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button onClick={() => setViewMode('add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'stats' && (
          <AssetStats 
            stats={getAssetStats()} 
            assets={assets}
            onAssetSelect={handleAssetSelect}
            onAssetEdit={handleAssetEdit}
            onAssetDelete={handleDeleteAsset}
          />
        )}

        {viewMode === 'list' && (
          <AssetList
            assets={assets}
            onAssetSelect={handleAssetSelect}
            onAssetEdit={handleAssetEdit}
            onAssetDelete={handleDeleteAsset}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        {viewMode === 'add' && (
          <AssetForm
            onSubmit={selectedAsset ? handleUpdateAsset : handleAddAsset}
            onCancel={() => {
              setViewMode('list')
              setSelectedAsset(null)
            }}
            initialData={selectedAsset || undefined}
          />
        )}

        {viewMode === 'detail' && selectedAsset && (
          <AssetDetail
            asset={selectedAsset}
            onBack={() => setViewMode('list')}
            onEdit={() => setViewMode('add')}
            onDelete={() => handleDeleteAsset(selectedAsset.id)}
            onUploadDocument={handleUploadDocument}
            onDownloadDocument={handleDownloadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
