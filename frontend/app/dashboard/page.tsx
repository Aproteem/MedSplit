"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Heart, ShoppingCart, Gift, DollarSign, User, Search, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function DashboardPage() {
  const [notifications] = useState([
    {
      id: 1,
      type: "approval",
      message: "Your request for Metformin has been approved by Dr. Smith",
      time: "2 hours ago",
      actionUrl: "/checkout/metformin-123",
    },
    {
      id: 2,
      type: "wishlist",
      message: "Lisinopril is now available for bulk order in your area",
      time: "1 day ago",
      actionUrl: "/buy-meds?med=lisinopril",
    },
  ])

  const [recentSearches] = useState([
    { name: "Metformin", lastSearched: "2 days ago" },
    { name: "Lisinopril", lastSearched: "1 week ago" },
    { name: "Atorvastatin", lastSearched: "2 weeks ago" },
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, John</h1>
            <p className="text-gray-600">Manage your medications and help your community</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/buy-meds">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Find Meds
              </Button>
            </Link>
            <Link href="/donate-meds">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Donate
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Donations Made</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grants Given</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$150</div>
              <p className="text-xs text-muted-foreground">Total contributed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">People helped</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Notifications
              </CardTitle>
              <CardDescription>Stay updated on your medication requests and community activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                  {notification.actionUrl && (
                    <Link href={notification.actionUrl}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
              <Link href="/notifications">
                <Button variant="ghost" className="w-full">
                  View All Notifications
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Medicine Searches</CardTitle>
              <CardDescription>Quick access to your previously searched medications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{search.name}</p>
                    <p className="text-sm text-gray-500">{search.lastSearched}</p>
                  </div>
                  <div className="flex items-center">
                    <Link href={`/buy-meds?med=${search.name.toLowerCase()}`}>
                      <Button size="sm" variant="ghost">
                        Search Again
                      </Button>
                      
                    </Link>
                  </div>
                </div>
              ))}
              <Link href="/buy-meds">
                <Button variant="ghost" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search New Medicine
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
