"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Save, 
  X, 
  Upload,
  FileText,
  Shield,
  Gavel,
  User,
  Scale,
  FileCheck
} from "lucide-react"

type DocumentType = 'will' | 'trust' | 'power_of_attorney' | 'healthcare_directive' | 'life_insurance' | 'deed' | 'other'

interface LegalDocumentFormData {
  title: string
  document_type: DocumentType
  description: string
  is_required: boolean
  notarization_required: boolean
  witnesses_required: number
  instructions: string
  tags: string[]
}

interface LegalDocumentFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: LegalDocumentFormData, file?: File) => Promise<void>
  initialData?: Partial<LegalDocumentFormData>
}

const DOCUMENT_TYPES = [
  { value: 'will', label: 'Last Will and Testament', icon: FileText, description: 'Your final wishes for asset distribution' },
  { value: 'trust', label: 'Trust Document', icon: Shield, description: 'Living or testamentary trust agreement' },
  { value: 'power_of_attorney', label: 'Power of Attorney', icon: Gavel, description: 'Legal authority to act on your behalf' },
  { value: 'healthcare_directive', label: 'Healthcare Directive', icon: User, description: 'Medical decisions and living will' },
  { value: 'life_insurance', label: 'Life Insurance Policy', icon: Scale, description: 'Insurance policy documents' },
  { value: 'deed', label: 'Property Deed', icon: FileCheck, description: 'Real estate ownership documents' },
  { value: 'other', label: 'Other Legal Document', icon: FileText, description: 'Other important legal documents' }
]

export function LegalDocumentForm({ isOpen, onClose, onSave, initialData }: LegalDocumentFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState<LegalDocumentFormData>({
    title: initialData?.title || '',
    document_type: initialData?.document_type || 'will',
    description: initialData?.description || '',
    is_required: initialData?.is_required || false,
    notarization_required: initialData?.notarization_required || false,
    witnesses_required: initialData?.witnesses_required || 0,
    instructions: initialData?.instructions || '',
    tags: initialData?.tags || []
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a document title')
      return
    }

    setLoading(true)
    try {
      await onSave(formData, selectedFile || undefined)
      onClose()
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Legal Document' : 'Add New Legal Document'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Document Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Last Will and Testament - 2024"
            />
          </div>

          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label>Document Type <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DOCUMENT_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = formData.document_type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, document_type: type.value as DocumentType }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    } cursor-pointer`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-primary-600' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload Document (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </label>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || !formData.title.trim()}>
            {loading ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {initialData ? 'Update' : 'Save'} Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
