"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Save, X, Users, Music, Book } from "lucide-react"

interface FuneralData {
  funeral_type?: string
  ceremony_location?: string
  religious_affiliation?: string
  open_casket?: boolean
  guest_list?: string
  music_preferences?: string
  readings?: string
  speakers?: string
  funeral_special_instructions?: string
}

interface FuneralDetailsProps {
  initialData?: FuneralData
  onSave: (data: FuneralData) => void
  onCancel: () => void
}

export function FuneralDetails({ initialData, onSave, onCancel }: FuneralDetailsProps) {
  const [funeralType, setFuneralType] = useState(initialData?.funeral_type || '')
  const [ceremonyLocation, setCeremonyLocation] = useState(initialData?.ceremony_location || '')
  const [religiousAffiliation, setReligiousAffiliation] = useState(initialData?.religious_affiliation || '')
  const [openCasket, setOpenCasket] = useState(initialData?.open_casket || false)
  const [guestList, setGuestList] = useState(initialData?.guest_list || '')
  const [musicPreferences, setMusicPreferences] = useState(initialData?.music_preferences || '')
  const [readings, setReadings] = useState(initialData?.readings || '')
  const [speakers, setSpeakers] = useState(initialData?.speakers || '')
  const [specialInstructions, setSpecialInstructions] = useState(initialData?.funeral_special_instructions || '')

  const handleSubmit = () => {
    onSave({
      funeral_type: funeralType,
      ceremony_location: ceremonyLocation,
      religious_affiliation: religiousAffiliation,
      open_casket: openCasket,
      guest_list: guestList,
      music_preferences: musicPreferences,
      readings: readings,
      speakers: speakers,
      funeral_special_instructions: specialInstructions,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Funeral Details
        </CardTitle>
        <CardDescription>
          Plan the ceremony and specify who should be invited
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="funeral-type">Funeral Type</Label>
            <Select value={funeralType} onValueChange={setFuneralType}>
              <SelectItem value="">Choose funeral type</SelectItem>
              <SelectItem value="traditional">Traditional Funeral Service</SelectItem>
              <SelectItem value="memorial">Memorial Service</SelectItem>
              <SelectItem value="celebration">Celebration of Life</SelectItem>
              <SelectItem value="private">Private Family Only</SelectItem>
              <SelectItem value="none">No Service</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ceremony-location">Ceremony Location</Label>
            <Input
              id="ceremony-location"
              placeholder="e.g., Church name, venue, or home"
              value={ceremonyLocation}
              onChange={(e) => setCeremonyLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="religious-affiliation">Religious Affiliation</Label>
            <Input
              id="religious-affiliation"
              placeholder="e.g., Catholic, Jewish, Non-religious"
              value={religiousAffiliation}
              onChange={(e) => setReligiousAffiliation(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Open Casket</Label>
              <p className="text-xs text-text-tertiary">
                Allow viewing during the service
              </p>
            </div>
            <Switch
              checked={openCasket}
              onCheckedChange={setOpenCasket}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-list" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Guest List / Who to Invite
            </Label>
            <Textarea
              id="guest-list"
              placeholder="List specific people or groups to invite (e.g., family, close friends, colleagues, etc.)"
              value={guestList}
              onChange={(e) => setGuestList(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="music-preferences" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Music Preferences
            </Label>
            <Textarea
              id="music-preferences"
              placeholder="Songs, hymns, or instrumental pieces you'd like played"
              value={musicPreferences}
              onChange={(e) => setMusicPreferences(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="readings" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Readings or Poems
            </Label>
            <Textarea
              id="readings"
              placeholder="Specific readings, poems, or passages you'd like included"
              value={readings}
              onChange={(e) => setReadings(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speakers">Speakers/Eulogists</Label>
            <Textarea
              id="speakers"
              placeholder="People you'd like to speak at your service"
              value={speakers}
              onChange={(e) => setSpeakers(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-instructions">Special Instructions</Label>
            <Textarea
              id="special-instructions"
              placeholder="Any other specific wishes for the ceremony, reception details, dress code, etc."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Details
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
