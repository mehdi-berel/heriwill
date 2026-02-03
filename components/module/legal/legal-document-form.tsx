"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  FileText,
  Shield,
  Gavel,
  User,
  Scale as ScaleIcon,
  FileCheck
} from "lucide-react"
import { logger } from "@/lib/utils/logger"
import { toast } from "@/lib/utils/toast"

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
  { value: 'life_insurance', label: 'Life Insurance Policy', icon: ScaleIcon, description: 'Insurance policy documents' },
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
      logger.error('Error creating legal document', error)
      toast.error('Failed to create legal document', 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF640', boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.2)' }}>
                <ScaleIcon className="h-8 w-8" style={{ color: '#8B5CF6' }} />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold" style={{ color: '#FAFAFA' }}>
                Choose Legal Document Template
              </h2>
              <p className="text-sm" style={{ color: '#A1A1AA' }}>
                Select a legal document template to add to your vault
              </p>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENT_TYPES.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value as DocumentType)}
                    disabled={loading}
                    className="p-4 rounded-lg border-2 transition-all text-left"
                    style={isSelected ? { 
                      backgroundColor: '#8B5CF620', 
                      borderColor: '#8B5CF6',
                      boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.2)'
                    } : { borderColor: '#232629' }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: isSelected ? '#8B5CF620' : '#27272A' }}>
                        <Icon className="h-5 w-5" style={{ color: isSelected ? '#8B5CF6' : '#71717A' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1 text-base" style={{ color: isSelected ? '#8B5CF6' : '#FAFAFA' }}>{type.label}</h3>
                        <p className="text-sm line-clamp-2" style={{ color: '#A1A1AA' }}>{type.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="w-full sm:w-auto h-12 text-base transition-all"
              style={{ borderColor: '#232629' }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirm}
              disabled={!selectedType || loading}
              className="w-full sm:w-auto h-12 text-base font-semibold transition-all"
              style={{ backgroundColor: '#8B5CF6', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}
            >
              {loading ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
