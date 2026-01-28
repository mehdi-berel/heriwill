"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from "lucide-react"

interface TestamentData {
  testament_title?: string
  testament_content?: string
  special_instructions?: string
  digital_assets_instructions?: string
  personal_messages?: string
}

interface TestamentDetailsProps {
  initialData?: TestamentData
  onSave: (data: TestamentData) => void
  onCancel: () => void
}

export function TestamentDetails({ initialData, onSave, onCancel }: TestamentDetailsProps) {
  const [formData, setFormData] = useState({
    testament_title: initialData?.testament_title || '',
    testament_content: initialData?.testament_content || '',
    special_instructions: initialData?.special_instructions || '',
    digital_assets_instructions: initialData?.digital_assets_instructions || '',
    personal_messages: initialData?.personal_messages || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Testament & Last Will
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Document your final testament and special instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="testament_title">Testament Title</Label>
            <Input
              id="testament_title"
              value={formData.testament_title}
              onChange={(e) => setFormData(prev => ({ ...prev, testament_title: e.target.value }))}
              placeholder="e.g., Last Will and Testament of [Your Name]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testament_content">Testament Content</Label>
            <Textarea
              id="testament_content"
              value={formData.testament_content}
              onChange={(e) => setFormData(prev => ({ ...prev, testament_content: e.target.value }))}
              placeholder="Write your main testament content here..."
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              This is your primary will document. Include your main wishes and distributions.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
              placeholder="Any special instructions for your heirs or executor..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="digital_assets_instructions">Digital Assets Instructions</Label>
            <Textarea
              id="digital_assets_instructions"
              value={formData.digital_assets_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, digital_assets_instructions: e.target.value }))}
              placeholder="Instructions for handling digital assets, accounts, and online presence..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal_messages">Personal Messages</Label>
            <Textarea
              id="personal_messages"
              value={formData.personal_messages}
              onChange={(e) => setFormData(prev => ({ ...prev, personal_messages: e.target.value }))}
              placeholder="Personal messages to loved ones..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Testament
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
