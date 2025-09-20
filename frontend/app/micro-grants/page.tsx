"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Heart, Clock, FileText, Plus, Users } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { GrantRequestForm } from "@/components/grant-request-form"

const grantRequests = [
  {
    id: 1,
    requesterName: "Maria S.",
    title: "Emergency Insulin Supply",
    description:
      "Lost my job last month and can't afford my insulin. Need help covering the cost until I find new employment. Have been diabetic for 15 years and this medication is critical for my survival.",
    amountNeeded: 180,
    amountRaised: 120,
    timePosted: "2 days ago",
    supporters: 8,
    verified: true,
    urgent: true,
  },
  {
    id: 2,
    requesterName: "James K.",
    title: "Heart Medication Support",
    description:
      "Recently diagnosed with heart condition. Insurance doesn't cover the full cost of my new medication. Working two jobs but still struggling to make ends meet.",
    amountNeeded: 150,
    amountRaised: 45,
    timePosted: "5 days ago",
    supporters: 3,
    verified: true,
    urgent: false,
  },
  {
    id: 3,
    requesterName: "Sarah M.",
    title: "Cancer Treatment Assistance",
    description:
      "Undergoing chemotherapy and need help with medication costs. The side effects make it hard to work full time. Any support would mean the world to me and my family.",
    amountNeeded: 200,
    amountRaised: 85,
    timePosted: "1 week ago",
    supporters: 6,
    verified: true,
    urgent: false,
  },
  {
    id: 4,
    requesterName: "Robert L.",
    title: "Diabetes Management",
    description:
      "Senior on fixed income struggling with rising medication costs. Need help covering my monthly diabetes supplies and medication. Have been managing this condition for over 20 years.",
    amountNeeded: 95,
    amountRaised: 25,
    timePosted: "3 days ago",
    supporters: 2,
    verified: false,
    urgent: false,
  },
]

const myGrants = [
  {
    id: 1,
    title: "Blood Pressure Medication",
    description: "Need help covering monthly medication costs",
    amountNeeded: 120,
    amountRaised: 120,
    status: "completed",
    supporters: 7,
    dateCreated: "2024-01-15",
  },
]

export default function MicroGrantsPage() {
  const [showGrantForm, setShowGrantForm] = useState(false)
  const [donatedGrants, setDonatedGrants] = useState<number[]>([])

  const handleDonate = (grantId: number) => {
    // In a real app, this would open a payment modal
    setDonatedGrants((prev) => [...prev, grantId])
    // Redirect to checkout page
    window.location.href = `/checkout/grant-${grantId}`
  }

  const getProgressPercentage = (raised: number, needed: number) => {
    return (raised / needed) * 100
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Micro Grants</h1>
            <p className="text-gray-600">Support community members with small medical grants under $200</p>
          </div>
          <Button onClick={() => setShowGrantForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Grant
          </Button>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Grants</TabsTrigger>
            <TabsTrigger value="my-grants">My Grants</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Grants</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{grantRequests.length}</div>
                  <p className="text-xs text-muted-foreground">Seeking support</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${grantRequests.reduce((sum, grant) => sum + grant.amountRaised, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Community support</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">People Helped</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {grantRequests.reduce((sum, grant) => sum + grant.supporters, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Supporters</p>
                </CardContent>
              </Card>
            </div>

            {/* Grant Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Current Grant Requests</h2>
                <p className="text-gray-600">{grantRequests.length} active requests</p>
              </div>

              {grantRequests.map((grant) => {
                const progressPercentage = getProgressPercentage(grant.amountRaised, grant.amountNeeded)
                const remainingAmount = grant.amountNeeded - grant.amountRaised
                const hasDonated = donatedGrants.includes(grant.id)

                return (
                  <Card key={grant.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Grant Info */}
                        <div className="lg:col-span-2 space-y-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{grant.title}</h3>
                              {grant.verified && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Verified
                                </Badge>
                              )}
                              {grant.urgent && <Badge variant="destructive">Urgent</Badge>}
                            </div>
                            <p className="text-gray-600">Requested by {grant.requesterName}</p>
                          </div>

                          <p className="text-gray-700 leading-relaxed">{grant.description}</p>

                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{grant.timePosted}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{grant.supporters} supporters</span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium">Funding Progress</span>
                              <span className="text-gray-600">
                                ${grant.amountRaised} of ${grant.amountNeeded}
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <p className="text-xs text-gray-500">
                              ${remainingAmount} remaining • {Math.round(progressPercentage)}% funded
                            </p>
                          </div>
                        </div>

                        {/* Donation Section */}
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-lg font-semibold text-blue-800">${remainingAmount}</p>
                            <p className="text-sm text-blue-600">Still needed</p>
                          </div>

                          <div className="space-y-2">
                            <Button
                              onClick={() => handleDonate(grant.id)}
                              disabled={hasDonated || remainingAmount === 0}
                              className="w-full"
                              variant={remainingAmount === 0 ? "secondary" : "default"}
                            >
                              {remainingAmount === 0 ? (
                                "Fully Funded"
                              ) : hasDonated ? (
                                "Donation Sent"
                              ) : (
                                <>
                                  <Heart className="h-4 w-4 mr-2" />
                                  Donate Now
                                </>
                              )}
                            </Button>

                            {remainingAmount === 0 && (
                              <div className="text-center">
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Goal Reached!
                                </Badge>
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 text-center">
                            All donations are secure and go directly to medical expenses
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-grants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Grant Requests</CardTitle>
                <CardDescription>Track your submitted grant requests and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                {myGrants.length > 0 ? (
                  <div className="space-y-4">
                    {myGrants.map((grant) => (
                      <div key={grant.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{grant.title}</h3>
                          <Badge
                            variant={grant.status === "completed" ? "default" : "secondary"}
                            className={grant.status === "completed" ? "bg-green-100 text-green-800" : ""}
                          >
                            {grant.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{grant.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>
                            ${grant.amountRaised} of ${grant.amountNeeded} raised
                          </span>
                          <span>{grant.supporters} supporters</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No grant requests yet</h3>
                    <p className="text-gray-600 mb-4">
                      Need help with medical expenses? Request a micro-grant from the community
                    </p>
                    <Button onClick={() => setShowGrantForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Request Your First Grant
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Grant Request Form Modal */}
        {showGrantForm && <GrantRequestForm onClose={() => setShowGrantForm(false)} />}
      </div>
    </DashboardLayout>
  )
}
