"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Download, Share, Calendar, MapPin, Heart, Pill, Home } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

// Mock data - in a real app, this would come from the API based on the ID
const getReceiptData = (id: string) => {
  const receiptId = `RCP-${Date.now().toString().slice(-6)}`
  const currentDate = new Date().toLocaleDateString()
  const currentTime = new Date().toLocaleTimeString()

  if (id.startsWith("grant-")) {
    return {
      type: "grant",
      receiptId,
      date: currentDate,
      time: currentTime,
      title: "Emergency Insulin Supply",
      recipient: "Maria S.",
      amount: 25,
      description: "Help Maria cover her insulin costs during unemployment",
      icon: Heart,
      status: "completed",
      transactionId: `TXN-${Date.now().toString().slice(-8)}`,
    }
  } else {
    return {
      type: "medicine",
      receiptId,
      date: currentDate,
      time: currentTime,
      title: "Metformin 500mg",
      genericName: "Metformin Hydrochloride",
      quantity: "30 tablets",
      bulkPrice: 28,
      originalPrice: 45,
      savings: 17,
      estimatedDelivery: "3-5 business days",
      trackingNumber: `TRK${Date.now().toString().slice(-10)}`,
      icon: Pill,
      status: "confirmed",
      transactionId: `TXN-${Date.now().toString().slice(-8)}`,
    }
  }
}

export default function ReceiptPage() {
  const params = useParams()
  const receiptData = getReceiptData(params.id as string)
  const IconComponent = receiptData.icon

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF receipt
    alert("Receipt download functionality would be implemented here")
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert("Share functionality would be implemented here")
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {receiptData.type === "grant" ? "Donation Successful!" : "Order Confirmed!"}
            </h1>
            <p className="text-gray-600">
              {receiptData.type === "grant"
                ? "Thank you for supporting a community member"
                : "Your medication order has been confirmed"}
            </p>
          </div>
        </div>

        {/* Receipt Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <IconComponent className="h-5 w-5" />
              <span>Receipt</span>
            </CardTitle>
            <CardDescription>Receipt #{receiptData.receiptId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{receiptData.title}</h3>
                  {receiptData.type === "medicine" ? (
                    <>
                      <p className="text-gray-600">{receiptData.genericName}</p>
                      <p className="text-sm text-gray-500">{receiptData.quantity}</p>
                      <Badge variant="default" className="bg-green-100 text-green-800 mt-2">
                        {receiptData.status === "confirmed" ? "Order Confirmed" : "Completed"}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600">Donation to {receiptData.recipient}</p>
                      <p className="text-sm text-gray-500">{receiptData.description}</p>
                      <Badge variant="default" className="bg-green-100 text-green-800 mt-2">
                        Donation Complete
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Order Summary</h4>
                {receiptData.type === "medicine" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="line-through text-gray-500">${receiptData.originalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bulk Price:</span>
                      <span>${receiptData.bulkPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>You Saved:</span>
                      <span>${receiptData.savings}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Paid:</span>
                      <span>${receiptData.bulkPrice}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Donation Amount:</span>
                      <span>${receiptData.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Processing Fee:</span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Donated:</span>
                      <span>${receiptData.amount}</span>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Transaction Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{receiptData.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-medium">{receiptData.time}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Transaction ID:</span>
                    <p className="font-medium font-mono text-xs">{receiptData.transactionId}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Info (for medicines only) */}
              {receiptData.type === "medicine" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Delivery Information</h4>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Estimated Delivery</span>
                      </div>
                      <p className="text-blue-700 text-sm">{receiptData.estimatedDelivery}</p>
                      <div className="flex items-center space-x-2 text-blue-800 mt-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Tracking Number</span>
                      </div>
                      <p className="text-blue-700 text-sm font-mono">{receiptData.trackingNumber}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1 bg-transparent">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
              {receiptData.type === "medicine" ? (
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You'll receive email updates about your order status</li>
                  <li>• Track your package using the tracking number above</li>
                  <li>• Contact support if you have any questions</li>
                </ul>
              ) : (
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your donation will help {receiptData.recipient} access needed medication</li>
                  <li>• You'll receive updates on how your contribution made a difference</li>
                  <li>• Thank you for being part of our caring community</li>
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          {receiptData.type === "medicine" ? (
            <Link href="/buy-meds">
              <Button>Continue Shopping</Button>
            </Link>
          ) : (
            <Link href="/micro-grants">
              <Button>View More Grants</Button>
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
