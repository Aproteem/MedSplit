"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Heart, Users, MapPin, Clock, CheckCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

const recentSearches = [
  { name: "Metformin", lastSearched: "2 days ago", status: "approved" },
  { name: "Lisinopril", lastSearched: "1 week ago", status: "pending" },
  { name: "Atorvastatin", lastSearched: "2 weeks ago", status: "wishlisted" },
]

const searchResults = [
  {
    id: 1,
    name: "Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    currentPrice: 45,
    bulkPrice: 28,
    currentDemand: 12,
    requiredDemand: 20,
    location: "Within 5 miles",
    estimatedTime: "3-5 days",
    inWishlist: false,
    description: "Used to treat type 2 diabetes",
  },
  {
    id: 2,
    name: "Lisinopril 10mg",
    genericName: "Lisinopril",
    currentPrice: 32,
    bulkPrice: 18,
    currentDemand: 18,
    requiredDemand: 20,
    location: "Within 2 miles",
    estimatedTime: "1-2 days",
    inWishlist: true,
    description: "ACE inhibitor for high blood pressure",
  },
  {
    id: 3,
    name: "Atorvastatin 20mg",
    genericName: "Atorvastatin Calcium",
    currentPrice: 55,
    bulkPrice: 35,
    currentDemand: 8,
    requiredDemand: 25,
    location: "Within 10 miles",
    estimatedTime: "7-10 days",
    inWishlist: false,
    description: "Statin medication for cholesterol",
  },
]

export default function BuyMedsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchActive, setSearchActive] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<number[]>([2])

  const handleSearch = () => {
    setSearchActive(true)
  }

  const toggleWishlist = (medId: number) => {
    setWishlistItems((prev) => (prev.includes(medId) ? prev.filter((id) => id !== medId) : [...prev, medId]))

    // Show notification for wishlist addition
    if (!wishlistItems.includes(medId)) {
      const med = searchResults.find((m) => m.id === medId)
      if (med) {
        // In a real app, this would trigger a toast notification
        alert(`Request verification for ${med.name} to doctor has been sent`)
      }
    }
  }

  const getDemandProgress = (current: number, required: number) => {
    return (current / required) * 100
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buy Medicines</h1>
          <p className="text-gray-600">Search for medications and join community bulk orders</p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for medicines (e.g., Metformin, Lisinopril)"
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

        {/* Recent Searches */}
        {!searchActive && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
              <CardDescription>
                Quick access to your previously searched medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-40 h-40 p-4 border rounded-2xl flex flex-col justify-between items-center hover:bg-gray-50"
                  >
                    <div className="text-center">
                      <p className="font-medium truncate">{search.name}</p>
                      <p className="text-sm text-gray-500">{search.lastSearched}</p>
                    </div>
                    <div className="flex flex-col space-y-2 items-center">
                      <Badge
                        variant={
                          search.status === "approved"
                            ? "default"
                            : search.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {search.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSearchQuery(search.name)
                          setSearchActive(true)
                        }}
                      >
                        Search Again
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchActive && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Search Results</h2>
              <p className="text-gray-600">{searchResults.length} medicines found</p>
            </div>

            {searchResults.map((med) => {
              const demandProgress = getDemandProgress(med.currentDemand, med.requiredDemand)
              const isInWishlist = wishlistItems.includes(med.id)

              return (
                <Card key={med.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Medicine Info */}
                      <div className="lg:col-span-2 space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{med.name}</h3>
                          <p className="text-gray-600">{med.genericName}</p>
                          <p className="text-sm text-gray-500 mt-1">{med.description}</p>
                        </div>

                        {/* Location and Time */}
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{med.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Est. {med.estimatedTime}</span>
                          </div>
                        </div>

                        {/* Demand Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>Community Demand</span>
                            </span>
                            <span className="font-medium">
                              {med.currentDemand}/{med.requiredDemand} people
                            </span>
                          </div>
                          <Progress value={demandProgress} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {med.requiredDemand - med.currentDemand} more people needed for bulk order
                          </p>
                        </div>
                      </div>

                      {/* Pricing and Actions */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Current Price:</span>
                              <span className="text-lg font-semibold text-gray-900">${med.currentPrice}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Bulk Price:</span>
                              <span className="text-lg font-semibold text-green-600">${med.bulkPrice}</span>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">You Save:</span>
                                <span className="text-lg font-bold text-green-600">
                                  ${med.currentPrice - med.bulkPrice}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            onClick={() => toggleWishlist(med.id)}
                            variant={isInWishlist ? "default" : "outline"}
                            className="w-full"
                          >
                            {isInWishlist ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                In Wishlist
                              </>
                            ) : (
                              <>
                                <Heart className="h-4 w-4 mr-2" />
                                Add to Wishlist
                              </>
                            )}
                          </Button>

                          {isInWishlist && (
                            <p className="text-xs text-center text-gray-500">Waiting for doctor approval</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {searchActive && searchResults.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No medicines found</h3>
              <p className="text-gray-600 mb-4">Try searching with a different medicine name or check the spelling.</p>
              <Button variant="outline" onClick={() => setSearchActive(false)}>
                View Recent Searches
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
