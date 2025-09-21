"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, Camera, FileText } from "lucide-react"
import { api } from "@/lib/api"
import { useCurrentUser } from "@/hooks/use-current-user"

interface DonationFormProps {
  onClose: () => void
  onSubmitted?: () => void
}

export function DonationForm({ onClose, onSubmitted }: DonationFormProps) {
  const { user } = useCurrentUser()
  const [formData, setFormData] = useState({
    medicineName: "",
    quantity: "",
    expiryDate: "",
    condition: "",
    doctorName: "",
    additionalNotes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      alert("Please log in to submit a donation.")
      return
    }
    setIsSubmitting(true)
    try {
      const payload = {
        donor_id: user.id,
        medicine_name: formData.medicineName,
        quantity: formData.quantity,
        quantity_text: formData.quantity,
        medicine_expires_at: formData.expiryDate || null,
        condition: formData.condition,
        doctor_name: formData.doctorName,
        notes: formData.additionalNotes,
      }
      const res = await fetch(api(`/api/donations`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || "Failed to submit donation")
      }
      alert("Donation submitted! We're verifying your medication documentation.")
      try { onSubmitted && onSubmitted() } catch {}
      onClose()
    } catch (err: any) {
      alert(err?.message || "Failed to submit donation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Donate Medicine</CardTitle>
            <CardDescription>Help your community by donating unused medications</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medicine Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medicine Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicine-name">Medicine Name *</Label>
                  <Input
                    id="medicine-name"
                    placeholder="e.g., Metformin 500mg"
                    value={formData.medicineName}
                    onChange={(e) => handleInputChange("medicineName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 30 tablets, 2 vials"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date *</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unopened">Unopened/Sealed</SelectItem>
                      <SelectItem value="opened-full">Opened but full</SelectItem>
                      <SelectItem value="opened-partial">Opened, partially used</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prescribing Doctor</h3>

              <div className="space-y-2">
                <Label htmlFor="doctor-name">Doctor's Name *</Label>
                <Input
                  id="doctor-name"
                  placeholder="Dr. Smith, Dr. Johnson, etc."
                  value={formData.doctorName}
                  onChange={(e) => handleInputChange("doctorName", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Medicine Photo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medicine Photo</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="space-y-2">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">Upload a clear photo of the medicine packaging</p>
                  <div className="flex justify-center space-x-2">
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button type="button" variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about the medicine, storage conditions, etc."
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                rows={3}
              />
            </div>

            {/* Verification Notice */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Verification Process</p>
                  <p className="text-blue-700 mt-1">
                    We'll cross-check this donation with your current medication documentation to ensure safety and
                    authenticity before making it available to the community.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit Donation"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
