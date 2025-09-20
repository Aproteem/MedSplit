"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Gift, MapPin, Clock, Calendar, Plus, Heart } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DonationForm } from "@/components/donation-form"

const availableDonations = [
  {
    id: 1,
    name: "Insulin Glargine 100 units/mL",
    donorName: "Sarah M.",
    location: "Within 3 miles",
    expiryDate: "2025-08-15",
    quantity: "2 vials",
    condition: "Unopened, refrigerated",
    timePosted: "2 hours ago",
    verified: true,
  },
  {
    id: 2,
    name: "Metformin 500mg",
    donorName: "John D.",
    location: "Within 1 mile",
    expiryDate: "2025-12-20",
    quantity: "60 tablets",
    condition: "Sealed bottle, 3/4 full",
    timePosted: "1 day ago",
    verified: true,
  },
  {
    id: 3,
    name: "Lisinopril 10mg",
    donorName: "Maria L.",
    location: "Within 5 miles",
    expiryDate: "2025-06-30",
    quantity: "45 tablets",
    condition: "Original packaging",
    timePosted: "3 days ago",
    verified: false,
  },
]

export default function DonateMedsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [requestedMeds, setRequestedMeds] = useState<number[]>([])

  const handleSearch = () => {
    // In a real app, this would filter the donations
    console.log("Searching for:", searchQuery)
  }

  const requestDonation = (donationId: number) => {
    setRequestedMeds((prev) => [...prev, donationId])
    const donation = availableDonations.find((d) => d.id === donationId)
    if (donation) {
      alert(`Request verification for ${donation.name} to doctor has been sent`)
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90 // Expiring within 3 months
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donate Medicines</h1>
            <p className="text-gray-600">Find donated medicines or share your unused medications</p>
          </div>
          <Button onClick={() => setShowDonationForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Donate Medicine
          </Button>
        </div>

        <Tabs defaultValue="find" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="find">Find Donations</TabsTrigger>
            <TabsTrigger value="my-donations">My Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search for donated medicines in your area..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <Button onClick={handleSearch} size="lg">
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Donations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Available Donations Near You</h2>
                <p className="text-gray-600">{availableDonations.length} donations available</p>
              </div>

              {availableDonations.map((donation) => {
                const isRequested = requestedMeds.includes(donation.id)
                const expiringSoon = isExpiringSoon(donation.expiryDate)

                return (
                  <Card key={donation.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Medicine Info */}
                        <div className="lg:col-span-2 space-y-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{donation.name}</h3>
                              {donation.verified && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Verified
                                </Badge>
                              )}
                              {expiringSoon && <Badge variant="destructive">Expires Soon</Badge>}
                            </div>
                            <p className="text-gray-600">Donated by {donation.donorName}</p>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{donation.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{donation.timePosted}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Gift className="h-4 w-4 text-gray-400" />
                              <span>{donation.quantity}</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Condition:</strong> {donation.condition}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-blue-800">Free Donation</p>
                            <p className="text-xs text-blue-600">Community supported</p>
                          </div>

                          <Button
                            onClick={() => requestDonation(donation.id)}
                            disabled={isRequested}
                            className="w-full"
                            variant={isRequested ? "secondary" : "default"}
                          >
                            {isRequested ? (
                              <>
                                <Heart className="h-4 w-4 mr-2" />
                                Request Sent
                              </>
                            ) : (
                              "Request Donation"
                            )}
                          </Button>

                          {isRequested && (
                            <p className="text-xs text-center text-gray-500">Waiting for doctor approval</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Donations</CardTitle>
                <CardDescription>Medicines you've donated to the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No donations yet</h3>
                  <p className="text-gray-600 mb-4">Help your community by donating unused medications</p>
                  <Button onClick={() => setShowDonationForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Donate Your First Medicine
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Donation Form Modal */}
        {showDonationForm && <DonationForm onClose={() => setShowDonationForm(false)} />}
      </div>
    </DashboardLayout>
  )
}
