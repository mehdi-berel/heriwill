"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from "lucide-react"

interface ExecutorData {
  executor_name?: string
  executor_email?: string
  executor_phone?: string
  executor_relationship?: string
  alternate_executor_name?: string
  alternate_executor_email?: string
  alternate_executor_phone?: string
  executor_powers?: string
  executor_compensation?: string
}

interface ExecutorDetailsProps {
  initialData?: ExecutorData
  onSave: (data: ExecutorData) => void
  onCancel: () => void
}

export function ExecutorDetails({ initialData, onSave, onCancel }: ExecutorDetailsProps) {
  const [formData, setFormData] = useState({
    executor_name: initialData?.executor_name || '',
    executor_email: initialData?.executor_email || '',
    executor_phone: initialData?.executor_phone || '',
    executor_relationship: initialData?.executor_relationship || '',
    alternate_executor_name: initialData?.alternate_executor_name || '',
    alternate_executor_email: initialData?.alternate_executor_email || '',
    alternate_executor_phone: initialData?.alternate_executor_phone || '',
    executor_powers: initialData?.executor_powers || '',
    executor_compensation: initialData?.executor_compensation || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Executor Information
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Designate who will execute your will and manage your estate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Primary Executor</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="executor_name">Full Name</Label>
                <Input
                  id="executor_name"
                  value={formData.executor_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, executor_name: e.target.value }))}
                  placeholder="Executor's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="executor_relationship">Relationship</Label>
                <Input
                  id="executor_relationship"
                  value={formData.executor_relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, executor_relationship: e.target.value }))}
                  placeholder="e.g., Spouse, Child, Attorney"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="executor_email">Email</Label>
                <Input
                  id="executor_email"
                  type="email"
                  value={formData.executor_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, executor_email: e.target.value }))}
                  placeholder="executor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="executor_phone">Phone</Label>
                <Input
                  id="executor_phone"
                  type="tel"
                  value={formData.executor_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, executor_phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Alternate Executor (Optional)</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alternate_executor_name">Full Name</Label>
                <Input
                  id="alternate_executor_name"
                  value={formData.alternate_executor_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, alternate_executor_name: e.target.value }))}
                  placeholder="Alternate executor's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternate_executor_email">Email</Label>
                <Input
                  id="alternate_executor_email"
                  type="email"
                  value={formData.alternate_executor_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, alternate_executor_email: e.target.value }))}
                  placeholder="alternate@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternate_executor_phone">Phone</Label>
              <Input
                id="alternate_executor_phone"
                type="tel"
                value={formData.alternate_executor_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, alternate_executor_phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="executor_powers">Executor Powers & Responsibilities</Label>
            <Textarea
              id="executor_powers"
              value={formData.executor_powers}
              onChange={(e) => setFormData(prev => ({ ...prev, executor_powers: e.target.value }))}
              placeholder="Specify the powers and responsibilities granted to your executor..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Example: &quot;Full authority to sell property, manage investments, pay debts&quot;
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="executor_compensation">Executor Compensation</Label>
            <Textarea
              id="executor_compensation"
              value={formData.executor_compensation}
              onChange={(e) => setFormData(prev => ({ ...prev, executor_compensation: e.target.value }))}
              placeholder="Specify compensation for executor services..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Example: &quot;Standard statutory fee&quot; or &quot;5% of estate value&quot;
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Executor Info
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
