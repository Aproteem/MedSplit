"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Lock, MapPin, Heart, Pill } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DashboardLayout } from "@/components/dashboard-layout";

// Mock data - in a real app, this would come from the API based on the ID
const getCheckoutData = (id: string) => {
  if (id.startsWith("grant-")) {
    return {
      type: "grant",
      id: id.replace("grant-", ""),
      title: "Emergency Insulin Supply",
      recipient: "Maria S.",
      amount: 25,
      description: "Help Maria cover her insulin costs during unemployment",
      icon: Heart,
    };
  } else {
    return {
      type: "medicine",
      id: id.replace("metformin-", ""),
      title: "Metformin 500mg",
      genericName: "Metformin Hydrochloride",
      quantity: "30 tablets",
      bulkPrice: 28,
      originalPrice: 45,
      savings: 17,
      estimatedDelivery: "3-5 business days",
      icon: Pill,
    };
  }
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const checkoutData = getCheckoutData(params.id as string);

  const [formData, setFormData] = useState({
    email: "john.doe@email.com",
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    city: "City",
    state: "State",
    zipCode: "12345",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Update counters for medicine purchases only
      try {
        if (checkoutData.type === "medicine" && user?.id) {
          void (async () => {
            try {
              const listRes = await fetch(
                api(`/api/counters?user_id=${user.id}`)
              );
              if (listRes.ok) {
                const list = await listRes.json();
                const c = Array.isArray(list) ? list[0] : null;
                if (c && c.id) {
                  const current = Number(c.medicine_purchases || 0);
                  await fetch(api(`/api/counters/${c.id}`), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ medicine_purchases: current + 1 }),
                  });
                } else {
                  await fetch(api(`/api/counters`), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      user_id: user.id,
                      medicine_purchases: 1,
                      donations: 0,
                      grant_given: 0,
                    }),
                  });
                }
              }
            } catch {}
          })();
        }
      } catch {}
      // If a notif_id was provided (from Take Action), delete the notification now that checkout is done
      try {
        const notifId = searchParams.get("notif_id");
        if (notifId) {
          void (async () => {
            try {
              await fetch(api(`/api/notifications/${notifId}`), {
                method: "DELETE",
              });
            } catch {}
          })();
        }
      } catch {}
      // Redirect to receipt page
      router.push(`/receipt/${params.id}`);
    }, 3000);
  };

  const IconComponent = checkoutData.icon;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">
            Complete your{" "}
            {checkoutData.type === "grant" ? "donation" : "purchase"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {checkoutData.title}
                    </h3>
                    {checkoutData.type === "medicine" ? (
                      <>
                        <p className="text-gray-600">
                          {checkoutData.genericName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {checkoutData.quantity}
                        </p>
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 mt-2"
                        >
                          Bulk Order Price
                        </Badge>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600">
                          Donation to {checkoutData.recipient}
                        </p>
                        <p className="text-sm text-gray-500">
                          {checkoutData.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {checkoutData.type === "medicine" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="line-through text-gray-500">
                          ${checkoutData.originalPrice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bulk Price:</span>
                        <span className="font-semibold">
                          ${checkoutData.bulkPrice}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>You Save:</span>
                        <span className="font-semibold">
                          ${checkoutData.savings}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${checkoutData.bulkPrice}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Donation Amount:</span>
                        <span className="font-semibold">
                          ${checkoutData.amount}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Processing Fee:</span>
                        <span>$0.00</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${checkoutData.amount}</span>
                      </div>
                    </>
                  )}
                </div>

                {checkoutData.type === "medicine" && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Estimated Delivery
                      </span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      {checkoutData.estimatedDelivery}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address (for medicines only) */}
              {checkoutData.type === "medicine" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="h-4 w-4" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        Credit or Debit Card
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            handleInputChange("cardNumber", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) =>
                              handleInputChange("expiryDate", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) =>
                              handleInputChange("cvv", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nameOnCard">Name on Card</Label>
                        <Input
                          id="nameOnCard"
                          value={formData.nameOnCard}
                          onChange={(e) =>
                            handleInputChange("nameOnCard", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    {checkoutData.type === "grant"
                      ? "Complete Donation"
                      : "Complete Purchase"}{" "}
                    - $
                    {checkoutData.type === "grant"
                      ? checkoutData.amount
                      : checkoutData.bulkPrice}
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                <Lock className="h-4 w-4 inline mr-1" />
                Your payment information is secure and encrypted
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
