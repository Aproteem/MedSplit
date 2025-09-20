import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, DollarSign, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">MedSplit</span>
          </div>
          <div className="space-x-4">
            <Link href="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
            Community-Driven Medicine Access Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-pretty">
            Leverage community power to reduce medicine costs, redistribute unused medication responsibly, and provide
            micro-finance support for vulnerable patients.
          </p>
          <div className="space-x-4">
            <Link href="/auth">
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">The Problem We Solve</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Current Challenges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-red-700">Niche medicines are prohibitively expensive</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-red-700">Under-insured patients can't afford treatments</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-red-700">Significant medicine wastage occurs</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Our Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-green-700">Community bulk purchasing for better prices</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-green-700">Safe redistribution of unused medications</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-green-700">Micro-grants for vulnerable patients</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How MedSplit Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Community Buying</CardTitle>
                <CardDescription>
                  Join others to reach bulk order thresholds and get medicines at reduced prices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Medicine Donation</CardTitle>
                <CardDescription>Safely donate unused medications to help others in your community</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Micro Grants</CardTitle>
                <CardDescription>
                  Request or provide small grants to help cover essential medical expenses
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Safe & Verified</h2>
          <p className="text-lg text-gray-600 mb-8">
            All transactions require healthcare provider verification. We ensure medication safety through proper
            documentation and verification processes.
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-8 py-3">
              Join MedSplit Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6" />
            <span className="text-xl font-bold">MedSplit</span>
          </div>
          <p className="text-gray-400">Making healthcare accessible through community collaboration</p>
        </div>
      </footer>
    </div>
  )
}
