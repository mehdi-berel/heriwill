"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Scale,
  Mail, 
  Trash2,
  Edit,
  Phone,
  CheckCircle,
  Save,
  X
} from "lucide-react"

interface Notary {
  id?: string
  name: string
  firm_name?: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  license_number?: string
  specialization?: string
  notes?: string
  is_primary: boolean
}

interface NotarySelectorProps {
  notaries: Notary[]
  onAddNotary: (notary: Notary) => void
  onUpdateNotary: (id: string, notary: Notary) => void
  onDeleteNotary: (id: string) => void
  onSetPrimary: (id: string) => void
  onViewDetails?: (notary: Notary) => void
  searchTerm?: string
  selectedFilter?: 'all' | 'primary' | 'secondary' | null
}

export function NotarySelector({ 
  notaries, 
  onAddNotary, 
  onUpdateNotary, 
  onDeleteNotary,
  onSetPrimary,
  onViewDetails
}: NotarySelectorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingNotary, setEditingNotary] = useState<Notary | null>(null)
  const [formData, setFormData] = useState<Notary>({
    name: '',
    firm_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    license_number: '',
    specialization: '',
    notes: '',
    is_primary: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingNotary?.id) {
      onUpdateNotary(editingNotary.id, formData)
    } else {
      onAddNotary(formData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      firm_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      license_number: '',
      specialization: '',
      notes: '',
      is_primary: false
    })
    setEditingNotary(null)
    setShowForm(false)
  }

  const handleEdit = (notary: Notary) => {
    setFormData(notary)
    setEditingNotary(notary)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Hidden button for header to trigger */}
      <button 
        onClick={() => setShowForm(true)} 
        data-add-notary-btn 
        className="hidden"
        aria-hidden="true"
      />

      {/* Notary List */}
      {notaries.length > 0 ? (
        <div className="space-y-3">
          {notaries.map((notary) => (
            <div
              key={notary.id}
              className="flex items-center p-4 bg-background-card border rounded-xl cursor-pointer hover:border-primary/50 transition-all group"
              style={{ borderColor: '#232629' }}
              onClick={() => onViewDetails?.(notary)}
            >
              {/* Icon Container */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                style={{ backgroundColor: 'rgb(124, 58, 237)' }}
              >
                <Scale className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-base font-semibold truncate">{notary.name}</h3>
                  {notary.is_primary && (
                    <div className="px-1.5 py-0.5 rounded bg-success/20 flex items-center">
                      <CheckCircle className="h-3 w-3 text-success" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{notary.email}</span>
                  {notary.phone && (
                    <>
                      <span>•</span>
                      <Phone className="h-3.5 w-3.5" />
                      <span>{notary.phone}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-2">
                {!notary.is_primary && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (notary.id) onSetPrimary(notary.id)
                    }}
                  >
                    Set Primary
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(notary)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (notary.id) onDeleteNotary(notary.id)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No notaries found</h3>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            Add your first notary to witness and certify your will and legal documents
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNotary ? 'Edit Notary' : 'Add New Notary'}</DialogTitle>
            <DialogDescription>
              {editingNotary ? 'Update notary information' : 'Add a notary to witness and certify your will'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Notary's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firm_name">Firm/Company Name</Label>
                  <Input
                    id="firm_name"
                    value={formData.firm_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, firm_name: e.target.value }))}
                    placeholder="Law firm or notary company"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="notary@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code *</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                    placeholder="Notary license number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="e.g., Estate Planning, Wills & Trusts"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this notary..."
                  rows={3}
                />
              </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingNotary ? 'Update Notary' : 'Add Notary'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
