"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectItem } from "@/components/ui/select"
import { Save, X, MapPin } from "lucide-react"

interface BurialData {
  burial_type?: string
  burial_location?: string
  specific_place?: string
  plot_number?: string
  casket_preference?: string
  clothing_preference?: string
  burial_special_requests?: string
}

interface BurialPreferencesProps {
  initialData?: BurialData
  onSave: (data: BurialData) => void
  onCancel: () => void
}

export function BurialPreferences({ initialData, onSave, onCancel }: BurialPreferencesProps) {
  const [burialType, setBurialType] = useState(initialData?.burial_type || '')
  const [burialLocation, setBurialLocation] = useState(initialData?.burial_location || '')
  const [specificPlace, setSpecificPlace] = useState(initialData?.specific_place || '')
  const [plotNumber, setPlotNumber] = useState(initialData?.plot_number || '')
  const [casketPreference, setCasketPreference] = useState(initialData?.casket_preference || '')
  const [clothingPreference, setClothingPreference] = useState(initialData?.clothing_preference || '')
  const [specialRequests, setSpecialRequests] = useState(initialData?.burial_special_requests || '')

  const handleSubmit = () => {
    onSave({
      burial_type: burialType,
      burial_location: burialLocation,
      specific_place: specificPlace,
      plot_number: plotNumber,
      casket_preference: casketPreference,
      clothing_preference: clothingPreference,
      burial_special_requests: specialRequests,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-500" />
          Burial Preferences
        </CardTitle>
        <CardDescription>
          Specify where and how you want to be laid to rest
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="burial-type">Burial Type</Label>
            <Select value={burialType} onValueChange={setBurialType}>
              <SelectItem value="">Choose burial type</SelectItem>
              <SelectItem value="traditional">Traditional Burial</SelectItem>
              <SelectItem value="cremation">Cremation</SelectItem>
              <SelectItem value="green">Green/Natural Burial</SelectItem>
              <SelectItem value="mausoleum">Mausoleum</SelectItem>
              <SelectItem value="sea">Burial at Sea</SelectItem>
              <SelectItem value="donation">Body Donation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="burial-location">Preferred Location</Label>
            <Input
              id="burial-location"
              placeholder="e.g., City, State, Country"
              value={burialLocation}
              onChange={(e) => setBurialLocation(e.target.value)}
            />
            <p className="text-xs text-text-tertiary">
              General area where you want to be buried
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specific-place">Specific Cemetery/Place</Label>
            <Input
              id="specific-place"
              placeholder="e.g., Greenwood Cemetery"
              value={specificPlace}
              onChange={(e) => setSpecificPlace(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plot-number">Plot Number (if known)</Label>
            <Input
              id="plot-number"
              placeholder="e.g., Section A, Plot 123"
              value={plotNumber}
              onChange={(e) => setPlotNumber(e.target.value)}
            />
          </div>

          {burialType === 'traditional' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="casket-preference">Casket Preference</Label>
                <Select value={casketPreference} onValueChange={setCasketPreference}>
                  <SelectItem value="">Choose casket type</SelectItem>
                  <SelectItem value="wood">Wood</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="eco-friendly">Eco-Friendly</SelectItem>
                  <SelectItem value="simple">Simple/Plain</SelectItem>
                  <SelectItem value="ornate">Ornate/Decorative</SelectItem>
                  <SelectItem value="no-preference">No Preference</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clothing-preference">Clothing Preference</Label>
                <Input
                  id="clothing-preference"
                  placeholder="e.g., Favorite suit, traditional attire"
                  value={clothingPreference}
                  onChange={(e) => setClothingPreference(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="special-requests">Special Requests or Instructions</Label>
            <Textarea
              id="special-requests"
              placeholder="Any specific wishes, items to be buried with you, religious requirements, etc."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
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
