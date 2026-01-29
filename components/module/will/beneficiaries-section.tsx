"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from "lucide-react"

interface BeneficiaryData {
  primary_beneficiaries: string
  contingent_beneficiaries: string
  specific_bequests: string
  residuary_clause: string
  distribution_instructions: string
}

interface BeneficiariesSectionProps {
  initialData?: Partial<BeneficiaryData>
  onSave: (data: BeneficiaryData) => void
  onCancel: () => void
}

export function BeneficiariesSection({ initialData, onSave, onCancel }: BeneficiariesSectionProps) {
  const [formData, setFormData] = useState({
    primary_beneficiaries: initialData?.primary_beneficiaries || '',
    contingent_beneficiaries: initialData?.contingent_beneficiaries || '',
    specific_bequests: initialData?.specific_bequests || '',
    residuary_clause: initialData?.residuary_clause || '',
    distribution_instructions: initialData?.distribution_instructions || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Beneficiaries & Distribution
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Specify who will receive your assets and how they should be distributed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="primary_beneficiaries">Primary Beneficiaries</Label>
            <Textarea
              id="primary_beneficiaries"
              value={formData.primary_beneficiaries}
              onChange={(e) => setFormData(prev => ({ ...prev, primary_beneficiaries: e.target.value }))}
              placeholder="List your primary beneficiaries and their shares..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Example: &quot;My spouse [Name] - 50%, My children equally - 50%&quot;
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contingent_beneficiaries">Contingent Beneficiaries</Label>
            <Textarea
              id="contingent_beneficiaries"
              value={formData.contingent_beneficiaries}
              onChange={(e) => setFormData(prev => ({ ...prev, contingent_beneficiaries: e.target.value }))}
              placeholder="List backup beneficiaries if primary beneficiaries are unable to inherit..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              These beneficiaries receive assets if primary beneficiaries predecease you
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specific_bequests">Specific Bequests</Label>
            <Textarea
              id="specific_bequests"
              value={formData.specific_bequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specific_bequests: e.target.value }))}
              placeholder="List specific items or amounts to specific people..."
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Example: &quot;My wedding ring to my daughter Sarah, My car to my son John&quot;
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="residuary_clause">Residuary Clause</Label>
            <Textarea
              id="residuary_clause"
              value={formData.residuary_clause}
              onChange={(e) => setFormData(prev => ({ ...prev, residuary_clause: e.target.value }))}
              placeholder="Who receives everything else not specifically mentioned..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This covers all remaining assets after specific bequests
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="distribution_instructions">Distribution Instructions</Label>
            <Textarea
              id="distribution_instructions"
              value={formData.distribution_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, distribution_instructions: e.target.value }))}
              placeholder="Special instructions for distributing assets..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Beneficiaries
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
