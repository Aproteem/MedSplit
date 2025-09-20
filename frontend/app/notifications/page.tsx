import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

const notifications = [
  {
    id: 1,
    type: "approval",
    title: "Medication Request Approved",
    message: "Your request for Metformin has been approved by Dr. Smith. You can now proceed to checkout.",
    time: "2 hours ago",
    read: false,
    actionUrl: "/checkout/metformin-123",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    id: 2,
    type: "bulk-order",
    title: "Bulk Order Available",
    message: "Lisinopril is now available for bulk order in your area. 15 people have joined the request.",
    time: "1 day ago",
    read: false,
    actionUrl: "/buy-meds?med=lisinopril",
    icon: Bell,
    iconColor: "text-blue-500",
  },
  {
    id: 3,
    type: "donation",
    title: "Donation Request",
    message: "Someone in your area is looking for Insulin. You have this medication in your donation list.",
    time: "2 days ago",
    read: true,
    actionUrl: "/donate-meds",
    icon: AlertCircle,
    iconColor: "text-orange-500",
  },
  {
    id: 4,
    type: "grant",
    title: "Grant Request Funded",
    message: "Your micro-grant request for $50 has been fully funded by the community.",
    time: "3 days ago",
    read: true,
    actionUrl: "/micro-grants",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    id: 5,
    type: "verification",
    title: "Document Verification Pending",
    message: "Please upload your prescription for Atorvastatin to complete your request.",
    time: "1 week ago",
    read: true,
    actionUrl: "/documents",
    icon: Clock,
    iconColor: "text-yellow-500",
  },
]

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated on your medication requests and community activity</p>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => {
            const IconComponent = notification.icon
            return (
              <Card
                key={notification.id}
                className={cn("transition-colors", !notification.read && "bg-blue-50 border-blue-200")}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={cn("p-2 rounded-full bg-gray-100", notification.iconColor)}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <div className="flex items-center space-x-2">
                          {!notification.read && <Badge variant="secondary">New</Badge>}
                          <span className="text-sm text-gray-500">{notification.time}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{notification.message}</p>

                      {notification.actionUrl && (
                        <Link href={notification.actionUrl}>
                          <Button size="sm">Take Action</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {notifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
