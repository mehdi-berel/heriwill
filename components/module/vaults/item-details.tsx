"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { getVaultFileSignedUrl, downloadVaultFile } from "@/app/actions/vaults"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Calendar,
  Clock,
  Lock,
  Key,
  StickyNote,
  Bitcoin,
  FileText,
  Image as ImageIcon,
  Video,
  Tag,
  Scale,
  Package
} from "lucide-react"

export type VaultItemType = 'password' | 'document' | 'video' | 'image' | 'note' | 'crypto' | 'bank' | 'other' | 'legal' | 'assets'

interface VaultItemMetadata {
  username?: string
  password?: string
  url?: string
  walletAddress?: string
  privateKey?: string
  network?: string
  content?: string
  fileName?: string
  fileUrl?: string
  fileSize?: string
  fileSizeBytes?: number
  description?: string
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
  storage_path?: string
  storage_bucket?: string
}

interface ItemDetailsProps {
  item: VaultItem | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onDownload?: () => void
}

const ITEM_TYPE_CONFIG = {
  password: { label: 'Password', icon: Key, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  note: { label: 'Note', icon: StickyNote, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  crypto: { label: 'Crypto Wallet', icon: Bitcoin, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  document: { label: 'Document', icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  image: { label: 'Image', icon: ImageIcon, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  video: { label: 'Video', icon: Video, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  bank: { label: 'Bank', icon: FileText, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  legal: { label: 'Legal Document', icon: Scale, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
  assets: { label: 'Asset', icon: Package, color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' },
  other: { label: 'Other', icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
} as const

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ItemDetails({ item, isOpen, onClose, onEdit, onDelete }: ItemDetailsProps) {
  const [showSensitive, setShowSensitive] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null)
  const videoBlobUrlRef = useRef<string | null>(null)
  
  // Generate signed file URL for private bucket files
  useEffect(() => {
    if (!item) return
    
    const generateFileUrl = async () => {
      const filePath = (item.metadata as Record<string, unknown>).filePath as string | undefined
      if (!filePath) return

      try {
        if (item.type === 'video') {
          // Videos need blob URLs to support range requests for playback
          const { base64, mimeType } = await downloadVaultFile(filePath, item.storage_bucket || 'vault-files')
          const byteCharacters = atob(base64)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: mimeType })
          const url = URL.createObjectURL(blob)
          videoBlobUrlRef.current = url
          setVideoBlobUrl(url)
        } else {
          // Images and documents work with signed URLs
          const signedUrl = await getVaultFileSignedUrl(filePath, item.storage_bucket || 'vault-files')
          setFileUrl(signedUrl)
        }
      } catch {
        setFileUrl(null)
        setVideoBlobUrl(null)
      }
    }
    
    if (item.type === 'image' || item.type === 'video' || item.type === 'document') {
      generateFileUrl()
    }

    return () => {
      if (videoBlobUrlRef.current) {
        URL.revokeObjectURL(videoBlobUrlRef.current)
        videoBlobUrlRef.current = null
      }
    }
  }, [item])
  
  if (!item) return null
  
  const typeConfig = ITEM_TYPE_CONFIG[item.type] || ITEM_TYPE_CONFIG.other
  const TypeIcon = typeConfig.icon

  const handleDownload = async () => {
    try {
      const filePath = (item.metadata as Record<string, unknown>).filePath as string | undefined
      if (filePath) {
        const { base64, mimeType } = await downloadVaultFile(filePath, item.storage_bucket || 'vault-files')
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = item.metadata.fileName || item.title || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else if (item.metadata.fileUrl) {
        const link = document.createElement('a')
        link.href = item.metadata.fileUrl
        link.download = item.metadata.fileName || 'download'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      const { logger } = await import('@/lib/utils/logger')
      logger.error('Download error', error)
    }
  }

  const renderMetadata = () => {
    switch (item.type) {
      case 'password':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Details</h3>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Username</p>
                    <p className="text-base text-text-primary">{item.metadata.username || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-text-secondary">Password</p>
                      <button
                        onClick={() => setShowSensitive(!showSensitive)}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-base text-text-primary font-mono">
                      {showSensitive ? (item.metadata.password || 'No password') : '••••••••••••'}
                    </p>
                  </div>
                  
                  {item.metadata.url && (
                    <div>
                      <p className="text-sm text-text-secondary mb-1">URL</p>
                      <a 
                        href={item.metadata.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-base text-primary-500 hover:text-primary-600 underline break-all"
                      >
                        {item.metadata.url}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'crypto':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Crypto Details</h3>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Wallet Address</p>
                    <p className="text-base text-text-primary font-mono break-all">
                      {item.metadata.walletAddress || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-text-secondary">Private Key</p>
                      <button
                        onClick={() => setShowSensitive(!showSensitive)}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-base text-text-primary font-mono break-all">
                      {showSensitive ? (item.metadata.privateKey || 'No key') : '••••••••••••'}
                    </p>
                  </div>
                  
                  {item.metadata.network && (
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Network</p>
                      <p className="text-base text-text-primary">{item.metadata.network}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'note':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Content</h3>
            
            <Card>
              <CardContent className="p-4">
                <p className="text-base text-text-primary whitespace-pre-wrap">
                  {item.metadata.content || 'No content'}
                </p>
              </CardContent>
            </Card>
          </div>
        )

      case 'document':
      case 'image':
      case 'video':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">File Details</h3>
            
            {(fileUrl || videoBlobUrl) && (
              <Card>
                <CardContent className="p-4">
                  {item.type === 'image' && fileUrl && (
                    <div className="mb-4 relative w-full" style={{ minHeight: '200px' }}>
                      <Image 
                        src={fileUrl}
                        alt={item.metadata.fileName || 'Image'}
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-96 object-contain rounded-lg"
                      />
                    </div>
                  )}
                  
                  {item.type === 'video' && videoBlobUrl && (
                    <div className="mb-4">
                      <video 
                        src={videoBlobUrl}
                        controls
                        className="w-full max-h-96 rounded-lg"
                      />
                    </div>
                  )}
                  
                  {item.type === 'document' && fileUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <iframe
                        src={fileUrl}
                        className="w-full rounded-lg"
                        style={{ height: '500px' }}
                        title={item.metadata.fileName || 'Document Preview'}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">File Name</p>
                      <p className="text-base text-text-primary">{item.metadata.fileName || 'Unknown'}</p>
                    </div>
                    
                    {item.metadata.fileSize && (
                      <div>
                        <p className="text-sm text-text-secondary mb-1">File Size</p>
                        <p className="text-base text-text-primary">{item.metadata.fileSize}</p>
                      </div>
                    )}
                    
                    {item.metadata.description && (
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Description</p>
                        <p className="text-base text-text-primary">{item.metadata.description}</p>
                      </div>
                    )}
                    
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl">{item.title}</DialogTitle>
              <Badge className={typeConfig.color}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">

      {/* Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Created</p>
                <p className="text-sm text-text-primary">{formatDate(item.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Updated</p>
                <p className="text-sm text-text-primary">{formatDate(item.updatedAt)}</p>
              </div>
            </div>
            
            {item.isEncrypted && (
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary-500" />
                <div>
                  <p className="text-xs text-text-secondary">Encryption</p>
                  <p className="text-sm text-primary-500 font-medium">Enabled</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

          {/* Metadata */}
          {renderMetadata()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
