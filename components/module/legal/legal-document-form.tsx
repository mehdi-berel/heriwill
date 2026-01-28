"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [tagInput, setTagInput] = useState('')
  
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
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
          <DialogDescription>
            Create or update important legal documents for notarization and estate planning
          </DialogDescription>
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

          {/* Description */}
          {/* Metadata Fields */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this document..."
              rows={3}
            />
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

          {/* Notary Requirements */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold text-sm">Notary Requirements</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notarization"
                checked={formData.notarization_required}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, notarization_required: checked as boolean }))
                }
              />
              <label
                htmlFor="notarization"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Notarization Required
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="witnesses">Number of Witnesses Required</Label>
              <Select
                value={formData.witnesses_required.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, witnesses_required: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">1 Witness</SelectItem>
                  <SelectItem value="2">2 Witnesses</SelectItem>
                  <SelectItem value="3">3 Witnesses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={formData.is_required}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_required: checked as boolean }))
                }
              />
              <label
                htmlFor="required"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as Required Document
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Any special instructions for notarization or execution..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags (press Enter)"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
