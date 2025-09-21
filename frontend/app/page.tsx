"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, DollarSign, Shield, Moon, Sun, ArrowRight, Sparkles, CheckCircle } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="glass border-b sticky top-0 z-50 animate-fade-in-up">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Heart className="h-8 w-8 text-primary animate-pulse-subtle" />
              <div className="absolute inset-0 h-8 w-8 text-primary/20 animate-ping" />
            </div>
            <span className="text-2xl font-bold gradient-text">MedSplit</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover-lift"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            <Link href="/auth">
              <Button variant="outline" className="hover-lift hover-glow bg-transparent">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="hover-lift hover-glow">
                Sign Up
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center animate-fade-in-up">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-scale-in">
            <Sparkles className="h-4 w-4" />
            <span>Trusted by 10,000+ community members</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance gradient-text-hero leading-tight">
            Community-Driven Medicine Access Platform
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 text-pretty max-w-3xl mx-auto leading-relaxed">
            Leverage community power to reduce medicine costs, redistribute unused medication responsibly, and provide
            micro-finance support for vulnerable patients.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button size="lg" className="px-8 py-4 text-lg hover-lift hover-glow group">
                Get Started Today
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg hover-lift glass-card bg-transparent">
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Doctor Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Community Trusted</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">The Problem We Solve</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Healthcare costs are rising, but community solutions can make a difference
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-destructive/20 bg-destructive/5 hover-lift animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-destructive text-2xl">Current Challenges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-destructive rounded-full mt-2 animate-pulse-subtle"></div>
                  <p className="text-destructive/80 text-lg">Niche medicines are prohibitively expensive</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-destructive rounded-full mt-2 animate-pulse-subtle"></div>
                  <p className="text-destructive/80 text-lg">Under-insured patients can't afford treatments</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-destructive rounded-full mt-2 animate-pulse-subtle"></div>
                  <p className="text-destructive/80 text-lg">Significant medicine wastage occurs</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-primary/20 bg-primary/5 hover-lift animate-slide-in-right"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle className="text-primary text-2xl">Our Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 animate-pulse-subtle"></div>
                  <p className="text-primary/80 text-lg">Community bulk purchasing for better prices</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 animate-pulse-subtle"></div>
                  <p className="text-primary/80 text-lg">Safe redistribution of unused medications</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 animate-pulse-subtle"></div>
                  <p className="text-primary/80 text-lg">Micro-grants for vulnerable patients</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">How MedSplit Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple ways to access affordable healthcare through community support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover-lift glass-card animate-scale-in">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-2xl w-fit">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Community Buying</CardTitle>
                <CardDescription className="text-lg leading-relaxed">
                  Join others to reach bulk order thresholds and get medicines at reduced prices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover-lift glass-card animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-accent/10 rounded-2xl w-fit">
                  <Heart className="h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-2xl">Medicine Donation</CardTitle>
                <CardDescription className="text-lg leading-relaxed">
                  Safely donate unused medications to help others in your community
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover-lift glass-card animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-2xl w-fit">
                  <DollarSign className="h-12 w-12 text-foreground" />
                </div>
                <CardTitle className="text-2xl">Micro Grants</CardTitle>
                <CardDescription className="text-lg leading-relaxed">
                  Request or provide small grants to help cover essential medical expenses
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center animate-fade-in-up">
          <div className="mx-auto mb-8 p-6 bg-primary/10 rounded-3xl w-fit">
            <Shield className="h-20 w-20 text-primary mx-auto" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Safe & Verified</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            All transactions require healthcare provider verification. We ensure medication safety through proper
            documentation and verification processes.
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-10 py-4 text-lg hover-lift hover-glow group">
              Join MedSplit Today
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">MedSplit</span>
          </div>
          <p className="text-muted-foreground text-lg mb-6">
            Making healthcare accessible through community collaboration
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact Us
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
