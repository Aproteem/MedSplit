"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Gift, MapPin, Clock, Calendar, Plus, Heart, CheckCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DonationForm } from "@/components/donation-form"
import { api } from "@/lib/api"
import { useCurrentUser } from "@/hooks/use-current-user"

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

type Donation = {
  id: number
  donor_id?: number
  medicine_id: number
  quantity: number
  created_at?: string
  medicine_expires_at?: string | null
  claimed_by?: number | null
  claim_status?: string | null
  medicine_name?: string
  condition?: string
  doctor_name?: string
  notes?: string
}

type Medicine = {
  id: number
  name: string
  generic_name: string
  description?: string
}

export default function DonateMedsPage() {
  const { user } = useCurrentUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchActive, setSearchActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Donation[]>([])
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [requestedMeds, setRequestedMeds] = useState<number[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [allDonations, setAllDonations] = useState<Donation[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    // Preload medicines to resolve medicine names in donation search results
    ;(async () => {
      try {
        const res = await fetch(api(`/api/medicines`))
        if (res.ok) {
          const list = (await res.json()) as Medicine[]
          setMedicines(Array.isArray(list) ? list : [])
        }
      } catch {}
    })()
  }, [])

  const medicineById = useMemo(() => {
    const map = new Map<number, Medicine>()
    for (const m of medicines) map.set(m.id, m)
    return map
  }, [medicines])

  const loadAllDonations = async () => {
    try {
      const res = await fetch(api(`/api/donations`))
      if (res.ok) {
        const list = (await res.json()) as Donation[]
        setAllDonations(Array.isArray(list) ? list : [])
      }
    } catch {}
  }

  useEffect(() => {
    void loadAllDonations()
  }, [])

  // Highlight claimed donations based on query param and add label
  const highlightId = Number(searchParams?.get("highlight") || 0)

  const handleSearch = async (override?: string) => {
    const q = (override ?? searchQuery).trim()
    setLoading(true)
    setError(null)
    setSearchActive(true)
    try {
      const url = q ? api(`/api/donations?query=${encodeURIComponent(q)}`) : api(`/api/donations`)
      const res = await fetch(url)
      if (!res.ok) throw new Error("Search failed")
      const list = (await res.json()) as Donation[]
      setResults(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setError(e?.message || "Failed to search")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const requestDonation = async (donationId: number) => {
    if (!user?.id) {
      alert("Please log in to request a donation.")
      return
    }
    try {
      const res = await fetch(api(`/api/donations/${donationId}/claim`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || "Failed to request donation")
      }
      setRequestedMeds((prev) => [...prev, donationId])
      alert("Request sent for verification")
      // Backend creates 1+ notifications (claimer, maybe donor). Increment for claimer
      try { window.dispatchEvent(new CustomEvent("medsplit:notifications-updated", { detail: { delta: 1 } })) } catch {}
    } catch (e: any) {
      alert(e?.message || "Failed to request donation")
    }
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleSearch()
                      }}
                      className="text-lg"
                    />
                  </div>
                  <Button onClick={() => handleSearch()} size="lg" disabled={loading}>
                    <Search className="h-5 w-5 mr-2" />
                    {loading ? "Searching..." : "Search"}
                  </Button>
                  {searchActive && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchActive(false)
                        setResults([])
                        setError(null)
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </CardContent>
            </Card>

            {/* Results or Default List */}
            {!searchActive && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Available Donations Near You</h2>
                  <p className="text-gray-600">{allDonations.length} donations available</p>
                </div>
                {allDonations.map((donation) => {
                  const isRequested = requestedMeds.includes(donation.id)
                  const isClaimed = Boolean(donation.claimed_by)
                  const med = donation.medicine_name || medicineById.get(donation.medicine_id)?.name || `Medicine #${donation.medicine_id}`
                  return (
                    <Card key={donation.id} className={"overflow-hidden " + (highlightId === donation.id ? "ring-2 ring-blue-400" : "") }>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{med}</h3>
                                {donation.claimed_by && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Claimed</span>
                                )}
                              </div>
                              {medicineById.get(donation.medicine_id)?.generic_name && (
                                <p className="text-gray-600">{medicineById.get(donation.medicine_id)?.generic_name}</p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Gift className="h-4 w-4 text-gray-400" />
                                <span>Quantity: {donation.quantity}</span>
                              </div>
                              {donation.created_at && (
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{new Date(donation.created_at).toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  Expires: {donation.medicine_expires_at ? new Date(donation.medicine_expires_at).toLocaleDateString() : "N/A"}
                                </span>
                              </div>
                            </div>
                            {(donation.condition || donation.doctor_name || donation.notes) && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  {donation.condition && (<><strong>Condition:</strong> {donation.condition}</>)}
                                  {donation.doctor_name && (<><span className="mx-2">•</span><strong>Doctor:</strong> {donation.doctor_name}</>)}
                                  {donation.notes && (<><span className="mx-2">•</span>{donation.notes}</>)}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                              <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                              <p className="text-sm font-medium text-blue-800">Free Donation</p>
                              <p className="text-xs text-blue-600">Community supported</p>
                            </div>
                            <Button
                              onClick={() => requestDonation(donation.id)}
                              disabled={isRequested || isClaimed}
                              className="w-full"
                              variant={isRequested || isClaimed ? "secondary" : "default"}
                            >
                              {isRequested ? (
                                <>
                                  <Heart className="h-4 w-4 mr-2" />
                                  Request Sent
                                </>
                              ) : isClaimed ? (
                                "Already Claimed"
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
            )}

            {searchActive && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Search Results</h2>
                  <p className="text-gray-600">{results.length} donations found</p>
                </div>
                {results.map((donation) => {
                  const med = donation.medicine_name || medicineById.get(donation.medicine_id)?.name
                  const isRequested = requestedMeds.includes(donation.id)
                  const isClaimed = Boolean(donation.claimed_by)
                  return (
                    <Card key={donation.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{med || `Medicine #${donation.medicine_id}`}</h3>
                              {medicineById.get(donation.medicine_id)?.generic_name && (
                                <p className="text-gray-600">{medicineById.get(donation.medicine_id)?.generic_name}</p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Gift className="h-4 w-4 text-gray-400" />
                                <span>Quantity: {donation.quantity}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  Expires: {donation.medicine_expires_at ? new Date(donation.medicine_expires_at).toLocaleDateString() : "N/A"}
                                </span>
                              </div>
                              {donation.claim_status && (
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-gray-400" />
                                  <span>Status: {donation.claim_status}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                              <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                              <p className="text-sm font-medium text-blue-800">Free Donation</p>
                              <p className="text-xs text-blue-600">Community supported</p>
                            </div>
                            <Button
                              onClick={() => requestDonation(donation.id)}
                              disabled={isRequested || isClaimed}
                              className="w-full"
                              variant={isRequested || isClaimed ? "secondary" : "default"}
                            >
                              {isRequested ? (
                                <>
                                  <Heart className="h-4 w-4 mr-2" />
                                  Request Sent
                                </>
                              ) : isClaimed ? (
                                "Already Claimed"
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
            )}

            {searchActive && !loading && results.length === 0 && !error && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No donations found</h3>
                  <p className="text-gray-600 mb-4">Try a different name or check the spelling.</p>
                  <Button variant="outline" onClick={() => setSearchActive(false)}>
                    View Default List
                  </Button>
                </CardContent>
              </Card>
            )}
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
        {showDonationForm && (
          <DonationForm
            onClose={() => setShowDonationForm(false)}
            onSubmitted={() => {
              void loadAllDonations()
              // if we were in search mode, refresh those results too
              if (searchActive) void handleSearch(searchQuery)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
