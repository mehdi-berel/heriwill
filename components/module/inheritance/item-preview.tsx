"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Key, 
  StickyNote, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Bitcoin, 
  Scale, 
  Package,
  Download,
  Copy,
  Eye,
  EyeOff,
  Calendar
} from "lucide-react"
import { useState, useCallback } from "react"

interface VaultItem {
  id: string
  title_encrypted: string
  item_type: string
  metadata: Record<string, unknown>
  tags?: string[]
  is_favorite: boolean | null
  created_at: string
  updated_at: string
}

interface ItemPreviewProps {
  item: VaultItem | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (itemId: string) => void
  previewUrl?: string | null
}

const ITEM_TYPE_ICONS = {
  password: Key,
  note: StickyNote,
  document: FileText,
  image: ImageIcon,
  video: Video,
  crypto: Bitcoin,
  legal: Scale,
  assets: Package,
  other: FileText
}

const ITEM_TYPE_COLORS = {
  password: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  note: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  document: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  image: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  video: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  crypto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  legal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  assets: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

export function ItemPreview({ item, isOpen, onClose, onDownload, previewUrl }: ItemPreviewProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose()
    }
  }, [onClose])

  if (!item) return null

  const Icon = ITEM_TYPE_ICONS[item.item_type as keyof typeof ITEM_TYPE_ICONS] || FileText
  const colorClass = ITEM_TYPE_COLORS[item.item_type as keyof typeof ITEM_TYPE_COLORS] || ITEM_TYPE_COLORS.other

  const metadata = (item.metadata || {}) as Record<string, string | number | boolean | null | undefined>

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const renderContent = () => {

    switch (item.item_type) {
      case 'password':
        return (
          <div className="space-y-4">
            {metadata.username && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="flex-1 p-2 bg-muted rounded">{String(metadata.username)}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(metadata.username as string, 'username')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {metadata.password && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="flex-1 p-2 bg-muted rounded font-mono">
                    {showPassword ? String(metadata.password) : '••••••••••••'}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(metadata.password as string, 'password')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {metadata.url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <a 
                    href={String(metadata.url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 p-2 bg-muted rounded text-blue-500 hover:underline truncate"
                  >
                    {String(metadata.url)}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(String(metadata.url), 'url')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      case 'crypto':
        return (
          <div className="space-y-4">
            {metadata.walletAddress && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="flex-1 p-2 bg-muted rounded font-mono text-sm break-all">
                    {String(metadata.walletAddress)}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(String(metadata.walletAddress), 'wallet')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {metadata.privateKey && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Private Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="flex-1 p-2 bg-muted rounded font-mono text-sm break-all">
                    {showPrivateKey ? String(metadata.privateKey) : '••••••••••••••••••••••••••••••••'}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(String(metadata.privateKey), 'privateKey')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {metadata.network && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Network</label>
                <p className="p-2 bg-muted rounded mt-1">{String(metadata.network)}</p>
              </div>
            )}
          </div>
        )

      case 'note':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Content</label>
              <div className="mt-1 p-4 bg-muted rounded whitespace-pre-wrap">
                {String(metadata.content || 'No content')}
              </div>
            </div>
            <Button 
              onClick={() => {
                const content = String(metadata.content || '')
                const blob = new Blob([content], { type: 'text/plain' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${item.title_encrypted?.replace(/[^a-z0-9]/gi, '_') || 'note'}.txt`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
              }}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as .txt
            </Button>
          </div>
        )

      case 'document':
      case 'image':
      case 'video':
        return (
          <div className="space-y-4">
            {/* Inline preview for images */}
            {item.item_type === 'image' && previewUrl && (
              <div className="rounded-lg overflow-hidden border bg-muted relative w-full" style={{ minHeight: 200 }}>
                <Image 
                  src={previewUrl} 
                  alt={item.title_encrypted || 'Image'} 
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            {/* Inline preview for videos */}
            {item.item_type === 'video' && previewUrl && (
              <div className="rounded-lg overflow-hidden border bg-black">
                <video 
                  src={previewUrl} 
                  controls 
                  className="w-full max-h-[400px]"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {/* Inline preview for PDFs */}
            {item.item_type === 'document' && previewUrl && String(metadata.fileName).toLowerCase().endsWith('.pdf') && (
              <div className="rounded-lg overflow-hidden border">
                <iframe 
                  src={previewUrl} 
                  className="w-full h-[500px]"
                  title={item.title_encrypted || 'Document'}
                />
              </div>
            )}
            {/* Loading state */}
            {!previewUrl && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p>Loading preview...</p>
              </div>
            )}
            {metadata.fileName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">File Name</label>
                <p className="p-2 bg-muted rounded mt-1">{String(metadata.fileName)}</p>
              </div>
            )}
            {metadata.fileSize && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">File Size</label>
                <p className="p-2 bg-muted rounded mt-1">{String(metadata.fileSize)}</p>
              </div>
            )}
            {metadata.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="p-2 bg-muted rounded mt-1">{String(metadata.description)}</p>
              </div>
            )}
          </div>
        )

      case 'legal':
      case 'assets':
        return (
          <div className="space-y-4">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key}>
                <label className="text-sm font-medium text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="p-2 bg-muted rounded mt-1">{String(value)}</p>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Metadata</label>
            <pre className="p-4 bg-muted rounded mt-1 text-sm overflow-auto max-h-96">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-lg ${colorClass}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{item.title_encrypted || 'Untitled'}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {item.item_type}
                </Badge>
                {item.is_favorite && (
                  <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    Favorite
                  </Badge>
                )}
              </div>
            </div>
            {onDownload && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(item.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Item Content */}
          {renderContent()}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Created</p>
                <p>{formatDate(item.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Updated</p>
                <p>{formatDate(item.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Copy Feedback */}
          {copiedField && (
            <div className="text-sm text-green-600 dark:text-green-400">
              ✓ {copiedField} copied to clipboard
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
