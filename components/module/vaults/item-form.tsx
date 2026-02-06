"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  X, 
  Eye, 
  EyeOff, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Key, 
  StickyNote, 
  Bitcoin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Scale,
  Package
} from "lucide-react"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

export type VaultItemType = 'password' | 'document' | 'video' | 'image' | 'note' | 'crypto' | 'bank' | 'other' | 'legal' | 'assets'

interface VaultItemMetadata {
  // Password
  username?: string
  password?: string
  url?: string
  
  // Crypto
  walletAddress?: string
  privateKey?: string
  network?: string
  
  // Note
  content?: string
  
  // File-based (document, image, video)
  fileName?: string
  fileUrl?: string
  fileSize?: string
  fileSizeBytes?: number
  description?: string
  
  // Legal & Assets
  linkedDocumentId?: string
  linkedAssetId?: string
  linkedItemType?: 'legal' | 'asset'
}

interface VaultItem {
  id?: string
  title: string
  type: VaultItemType
  metadata: VaultItemMetadata
  isEncrypted: boolean
  tags: string[]
  createdAt?: string
  updatedAt?: string
}

interface ItemFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: VaultItem) => Promise<void>
  initialData?: VaultItem
  vaultId: string
  vaultCategory?: 'share' | 'delete' | 'pro'
}

const ITEM_TYPES = [
  { value: 'password', label: 'Password', icon: Key, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'note', label: 'Note', icon: StickyNote, color: 'bg-gray-100 text-gray-800' },
  { value: 'crypto', label: 'Crypto Wallet', icon: Bitcoin, color: 'bg-orange-100 text-orange-800' },
  { value: 'document', label: 'Document', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  { value: 'image', label: 'Image', icon: ImageIcon, color: 'bg-green-100 text-green-800' },
  { value: 'video', label: 'Video', icon: Video, color: 'bg-purple-100 text-purple-800' },
]

const PRO_ITEM_TYPES = [
  { value: 'legal', label: 'Legal Document', icon: Scale, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'assets', label: 'Asset', icon: Package, color: 'bg-teal-100 text-teal-800' },
]

const getDefaultMetadata = (type: VaultItemType): VaultItemMetadata => {
  switch (type) {
    case 'password':
      return { username: '', password: '', url: '' }
    case 'note':
      return { content: '' }
    case 'crypto':
      return { walletAddress: '', privateKey: '', network: '' }
    case 'document':
    case 'image':
    case 'video':
      return { fileName: '', fileUrl: '', fileSize: '', description: '' }
    case 'legal':
      return { linkedDocumentId: '', linkedItemType: 'legal' }
    case 'assets':
      return { linkedAssetId: '', linkedItemType: 'asset' }
    default:
      return {}
  }
}

export function ItemForm({ isOpen, onClose, onSave, initialData, vaultCategory }: ItemFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  
  
  const [formData, setFormData] = useState<VaultItem>(() => ({
    title: initialData?.title || '',
    type: initialData?.type || 'password',
    metadata: initialData?.metadata || getDefaultMetadata(initialData?.type || 'password'),
    isEncrypted: initialData?.isEncrypted !== undefined ? initialData.isEncrypted : true,
    tags: initialData?.tags || [],
  }))
  
  const isProVault = vaultCategory === 'pro'

  const handleTypeChange = (type: VaultItemType) => {
    setFormData(prev => ({
      ...prev,
      type,
      metadata: getDefaultMetadata(type)
    }))
  }

  const handleMetadataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setUploadError('')
    
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        fileName: file.name
      }
    }))
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError('No file selected')
      return
    }

    setIsUploading(true)
    setUploadError('')

    try {
      const { uploadVaultItemFile } = await import('@/app/actions/vaults')

      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedFile)
      formDataUpload.append('folder', 'documents')

      const { filePath, fileSize } = await uploadVaultItemFile(formDataUpload)
      
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          fileUrl: filePath,
          filePath: filePath,
          fileSize: formatFileSize(fileSize),
          fileSizeBytes: fileSize
        }
      }))
      
      setUploadError('')
    } catch (error) {
      logger.error('Upload error', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isFormValid = (): boolean => {
    if (!formData.title.trim()) return false
    
    switch (formData.type) {
      case 'password':
        return !!(formData.metadata.password)
      case 'note':
        return !!(formData.metadata.content)
      case 'crypto':
        return !!(formData.metadata.walletAddress)
      case 'document':
      case 'image':
      case 'video':
        return !!(formData.metadata.fileUrl)
      case 'legal':
        return !!(formData.metadata.linkedDocumentId)
      case 'assets':
        return !!(formData.metadata.linkedAssetId)
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return
    
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      logger.error('Error saving item', error)
      toast.error('Failed to save item', 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const renderMetadataFields = () => {
    switch (formData.type) {
      case 'password':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.metadata.username || ''}
                onChange={(e) => handleMetadataChange('username', e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.metadata.password || ''}
                  onChange={(e) => handleMetadataChange('password', e.target.value)}
                  placeholder="Enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                type="url"
                value={formData.metadata.url || ''}
                onChange={(e) => handleMetadataChange('url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        )

      case 'note':
        return (
          <div className="space-y-2">
            <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
            <Textarea
              id="content"
              value={formData.metadata.content || ''}
              onChange={(e) => handleMetadataChange('content', e.target.value)}
              placeholder="Enter your note content..."
              rows={8}
            />
          </div>
        )

      case 'crypto':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address <span className="text-red-500">*</span></Label>
              <Input
                id="walletAddress"
                value={formData.metadata.walletAddress || ''}
                onChange={(e) => handleMetadataChange('walletAddress', e.target.value)}
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key</Label>
              <div className="relative">
                <Input
                  id="privateKey"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.metadata.privateKey || ''}
                  onChange={(e) => handleMetadataChange('privateKey', e.target.value)}
                  placeholder="Enter private key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Input
                id="network"
                value={formData.metadata.network || ''}
                onChange={(e) => handleMetadataChange('network', e.target.value)}
                placeholder="Bitcoin, Ethereum, etc."
              />
            </div>
          </div>
        )

      case 'document':
      case 'image':
      case 'video':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File <span className="text-red-500">*</span></Label>
              
              {!formData.metadata.fileUrl ? (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept={
                      formData.type === 'image' ? 'image/*' :
                      formData.type === 'video' ? 'video/*' :
                      '.pdf,.doc,.docx,.txt'
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? selectedFile.name : 'Choose File'}
                  </Button>
                  
                  {selectedFile && !isUploading && (
                    <Button
                      type="button"
                      onClick={handleFileUpload}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  )}
                  
                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-600">Uploading...</span>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">{uploadError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg" style={{ borderColor: '#232629' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">{formData.metadata.fileName}</p>
                        <p className="text-xs text-green-600">{formData.metadata.fileSize}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            fileUrl: '',
                            fileSize: '',
                            fileSizeBytes: undefined
                          }
                        }))
                        setSelectedFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.metadata.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>
          </div>
        )

      case 'legal':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedDocument">Select Legal Document <span className="text-red-500">*</span></Label>
              <Select
                value={formData.metadata.linkedDocumentId || ''}
                onValueChange={(value) => handleMetadataChange('linkedDocumentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a legal document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doc1">Last Will and Testament</SelectItem>
                  <SelectItem value="doc2">Durable Power of Attorney</SelectItem>
                  <SelectItem value="doc3">Healthcare Directive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Link an existing legal document from your Legal Documents page
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Notes (Optional)</Label>
              <Textarea
                id="description"
                value={formData.metadata.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder="Add notes about this document..."
                rows={3}
              />
            </div>
          </div>
        )

      case 'assets':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedAsset">Select Asset <span className="text-red-500">*</span></Label>
              <Select
                value={formData.metadata.linkedAssetId || ''}
                onValueChange={(value) => handleMetadataChange('linkedAssetId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset1">Family Home - 123 Main St</SelectItem>
                  <SelectItem value="asset2">Investment Portfolio</SelectItem>
                  <SelectItem value="asset3">2020 Tesla Model 3</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Link an existing asset from your Assets page
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Notes (Optional)</Label>
              <Textarea
                id="description"
                value={formData.metadata.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder="Add notes about this asset..."
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {initialData ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {initialData ? 'Update the details of your vault item' : 'Add a new item to your vault'}
        </DialogDescription>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF640', boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.2)' }}>
                <Package className="h-8 w-8" style={{ color: '#8B5CF6' }} />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>
                {initialData ? 'Edit Item' : 'Add New Item'}
              </h2>
              <p className="text-sm" style={{ color: '#A1A1AA' }}>
                {initialData ? 'Update the details of your vault item' : 'Add a new item to your vault'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-status-error/10 border-l-4 border-status-error">
              <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-error flex-1">{uploadError}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter item title"
                  className="pl-12 h-12 transition-colors"
                  style={{ backgroundColor: '#141417', borderColor: '#232629' }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Item Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ITEM_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value as VaultItemType)}
                    disabled={!!initialData}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      initialData ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={isSelected ? { 
                      backgroundColor: '#8B5CF620', 
                      borderColor: '#8B5CF6',
                      boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.2)'
                    } : { borderColor: '#232629' }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5" style={{ color: isSelected ? '#8B5CF6' : '#71717A' }} />
                      <span className="text-xs font-medium" style={{ color: isSelected ? '#8B5CF6' : '#A1A1AA' }}>
                        {type.label}
                      </span>
                    </div>
                  </button>
                )
              })}
              {isProVault && PRO_ITEM_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value as VaultItemType)}
                    disabled={!!initialData}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      initialData ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={isSelected ? { 
                      backgroundColor: '#8B5CF620', 
                      borderColor: '#8B5CF6',
                      boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.2)'
                    } : { borderColor: '#232629' }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5" style={{ color: isSelected ? '#8B5CF6' : '#71717A' }} />
                      <span className="text-xs font-medium" style={{ color: isSelected ? '#8B5CF6' : '#A1A1AA' }}>
                        {type.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

            {/* Metadata Fields */}
            {renderMetadataFields()}

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button 
                onClick={onClose} 
                variant="outline" 
                disabled={loading}
                className="w-full sm:w-auto h-12 text-base transition-all"
                style={{ borderColor: '#232629' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !isFormValid()}
                className="w-full sm:w-auto h-12 text-base font-semibold transition-all"
                style={{ backgroundColor: '#8B5CF6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}
              >
                {loading ? 'Saving...' : (initialData ? 'Update Item' : 'Save Item')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
