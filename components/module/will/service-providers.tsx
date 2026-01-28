"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, X, Building2, Phone, Mail } from "lucide-react"

interface ServiceProvidersData {
  funeral_home?: string
  funeral_home_phone?: string
  funeral_home_email?: string
  cemetery?: string
  cemetery_phone?: string
  florist?: string
  florist_phone?: string
  caterer?: string
  caterer_phone?: string
  clergy?: string
  clergy_phone?: string
  additional_contacts?: string
}

interface ServiceProvidersProps {
  initialData?: ServiceProvidersData
  onSave: (data: ServiceProvidersData) => void
  onCancel: () => void
}

export function ServiceProviders({ initialData, onSave, onCancel }: ServiceProvidersProps) {
  const [funeralHome, setFuneralHome] = useState(initialData?.funeral_home || '')
  const [funeralHomePhone, setFuneralHomePhone] = useState(initialData?.funeral_home_phone || '')
  const [funeralHomeEmail, setFuneralHomeEmail] = useState(initialData?.funeral_home_email || '')
  const [cemetery, setCemetery] = useState(initialData?.cemetery || '')
  const [cemeteryPhone, setCemeteryPhone] = useState(initialData?.cemetery_phone || '')
  const [florist, setFlorist] = useState(initialData?.florist || '')
  const [floristPhone, setFloristPhone] = useState(initialData?.florist_phone || '')
  const [caterer, setCaterer] = useState(initialData?.caterer || '')
  const [catererPhone, setCatererPhone] = useState(initialData?.caterer_phone || '')
  const [clergy, setClergy] = useState(initialData?.clergy || '')
  const [clergyPhone, setClergyPhone] = useState(initialData?.clergy_phone || '')
  const [additionalContacts, setAdditionalContacts] = useState(initialData?.additional_contacts || '')

  const handleSubmit = () => {
    onSave({
      funeral_home: funeralHome,
      funeral_home_phone: funeralHomePhone,
      funeral_home_email: funeralHomeEmail,
      cemetery: cemetery,
      cemetery_phone: cemeteryPhone,
      florist: florist,
      florist_phone: floristPhone,
      caterer: caterer,
      caterer_phone: catererPhone,
      clergy: clergy,
      clergy_phone: clergyPhone,
      additional_contacts: additionalContacts,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-green-500" />
          Service Providers
        </CardTitle>
        <CardDescription>
          Companies and contacts to handle your arrangements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Funeral Home */}
          <div className="space-y-3 p-4 bg-background-secondary rounded-lg">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Funeral Home
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="funeral-home">Company Name</Label>
                <Input
                  id="funeral-home"
                  placeholder="e.g., Smith & Sons Funeral Home"
                  value={funeralHome}
                  onChange={(e) => setFuneralHome(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="funeral-home-phone" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </Label>
                  <Input
                    id="funeral-home-phone"
                    placeholder="(555) 123-4567"
                    value={funeralHomePhone}
                    onChange={(e) => setFuneralHomePhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funeral-home-email" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <Input
                    id="funeral-home-email"
                    type="email"
                    placeholder="contact@funeral.com"
                    value={funeralHomeEmail}
                    onChange={(e) => setFuneralHomeEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cemetery */}
          <div className="space-y-3 p-4 bg-background-secondary rounded-lg">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Cemetery
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cemetery">Cemetery Name</Label>
                <Input
                  id="cemetery"
                  placeholder="e.g., Greenwood Cemetery"
                  value={cemetery}
                  onChange={(e) => setCemetery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cemetery-phone" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Input
                  id="cemetery-phone"
                  placeholder="(555) 123-4567"
                  value={cemeteryPhone}
                  onChange={(e) => setCemeteryPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Florist */}
          <div className="space-y-3 p-4 bg-background-secondary rounded-lg">
            <h3 className="font-semibold text-sm">Florist</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="florist">Florist Name</Label>
                <Input
                  id="florist"
                  placeholder="e.g., Blooms & Petals"
                  value={florist}
                  onChange={(e) => setFlorist(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="florist-phone" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Input
                  id="florist-phone"
                  placeholder="(555) 123-4567"
                  value={floristPhone}
                  onChange={(e) => setFloristPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Caterer */}
          <div className="space-y-3 p-4 bg-background-secondary rounded-lg">
            <h3 className="font-semibold text-sm">Caterer (for reception)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="caterer">Caterer Name</Label>
                <Input
                  id="caterer"
                  placeholder="e.g., Elegant Events Catering"
                  value={caterer}
                  onChange={(e) => setCaterer(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caterer-phone" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Input
                  id="caterer-phone"
                  placeholder="(555) 123-4567"
                  value={catererPhone}
                  onChange={(e) => setCatererPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Clergy */}
          <div className="space-y-3 p-4 bg-background-secondary rounded-lg">
            <h3 className="font-semibold text-sm">Clergy/Officiant</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="clergy">Name</Label>
                <Input
                  id="clergy"
                  placeholder="e.g., Father John Smith"
                  value={clergy}
                  onChange={(e) => setClergy(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clergy-phone" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Input
                  id="clergy-phone"
                  placeholder="(555) 123-4567"
                  value={clergyPhone}
                  onChange={(e) => setClergyPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Additional Contacts */}
          <div className="space-y-2">
            <Label htmlFor="additional-contacts">Additional Contacts</Label>
            <Textarea
              id="additional-contacts"
              placeholder="Any other service providers, vendors, or important contacts"
              value={additionalContacts}
              onChange={(e) => setAdditionalContacts(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Providers
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
