"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  FileText,
  Shield,
  Gavel,
  User,
  Scale,
  FileCheck
} from "lucide-react"

type DocumentType = 'will' | 'trust' | 'power_of_attorney' | 'healthcare_directive' | 'life_insurance' | 'deed' | 'other'

interface LegalDocumentFormData {
  document_type: DocumentType
}

interface LegalDocumentFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (documentType: DocumentType) => Promise<void>
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
  const [selectedType, setSelectedType] = useState<DocumentType | null>(initialData?.document_type || null)

  const handleConfirm = async () => {
    if (!selectedType) return
    
    setLoading(true)
    try {
      await onSave(selectedType)
      onClose()
    } catch (error) {
      console.error('Error creating legal document:', error)
      alert('Failed to create legal document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Choose Legal Document Template</DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select a legal document template to add to your vault
          </p>
        </DialogHeader>

        <div className="py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {DOCUMENT_TYPES.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value as DocumentType)}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left hover:border-primary active:scale-[0.99] ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
                    }`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 text-sm sm:text-base">{type.label}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{type.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleConfirm}
            disabled={!selectedType || loading}
            className="w-full sm:w-auto h-11"
          >
            {loading ? 'Creating...' : 'Create Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
