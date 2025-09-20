"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart, User, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [userType, setUserType] = useState<"patient" | "provider">("patient")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async () => {
    setIsLoading(true)
    // Simulate Auth0 authentication
    setTimeout(() => {
      setIsLoading(false)
      // For demo purposes, redirect to dashboard
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">MedSplit</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Join MedSplit</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Sign up to join the MedSplit community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" />
            </div>

            {/* User Type Selection */}
            <div className="space-y-3">
              <Label>I am a:</Label>
              <RadioGroup value={userType} onValueChange={(value: "patient" | "provider") => setUserType(value)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="patient" id="patient" />
                  <User className="h-4 w-4" />
                  <Label htmlFor="patient" className="flex-1 cursor-pointer">
                    Patient - Looking for affordable medications
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="provider" id="provider" />
                  <Stethoscope className="h-4 w-4" />
                  <Label htmlFor="provider" className="flex-1 cursor-pointer">
                    Healthcare Provider - Helping patients access care
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {userType === "provider" && (
              <div className="space-y-2">
                <Label htmlFor="work-email">Work Email (for verification)</Label>
                <Input id="work-email" type="email" placeholder="Enter your work email" />
                <p className="text-sm text-gray-500">
                  We'll verify your healthcare provider status using your work email
                </p>
              </div>
            )}

            <Button className="w-full" onClick={handleSignup} disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
