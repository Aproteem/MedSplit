"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Menu, ShoppingCart, Gift, DollarSign, User, FileText, Bell, LogOut, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/use-current-user"
import { api } from "@/lib/api"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Buy Meds", href: "/buy-meds", icon: ShoppingCart },
  { name: "Donate Meds", href: "/donate-meds", icon: Gift },
  { name: "Micro Grants", href: "/micro-grants", icon: DollarSign },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Documents", href: "/documents", icon: FileText },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useCurrentUser()
  const [displayName, setDisplayName] = useState<string>("")
  const [roleLabel, setRoleLabel] = useState<string>("")
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const initials = useMemo(() => {
    const source = displayName || user?.email || ""
    return source.trim().slice(0, 2).toUpperCase() || "U"
  }, [displayName, user?.email])

  const loadProfileAndUnread = async () => {
    if (!user?.id) {
      setDisplayName("")
      setRoleLabel("")
      setUnreadCount(0)
      return
    }
    try {
      // Role label
      setRoleLabel(user.role === "doctor" ? "Doctor" : "Patient")
      // Name from profile, fallback to email prefix
      const pRes = await fetch(api(`/api/profiles?user_id=${user.id}`))
      if (pRes.ok) {
        const list = await pRes.json()
        const p = Array.isArray(list) ? list[0] : null
        if (p) {
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim()
          setDisplayName(name || (user.email ? String(user.email).split("@")[0] : ""))
        } else {
          setDisplayName(user.email ? String(user.email).split("@")[0] : "")
        }
      } else {
        setDisplayName(user.email ? String(user.email).split("@")[0] : "")
      }
      // Unread notifications count
      const nRes = await fetch(api(`/api/notifications?user_id=${user.id}`))
      if (nRes.ok) {
        const list = await nRes.json()
        const arr = Array.isArray(list) ? list : []
        const unread = arr.filter((n: any) => !n.read).length
        setUnreadCount(unread)
      } else {
        setUnreadCount(0)
      }
    } catch {
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    void loadProfileAndUnread()
  }, [user?.id])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ delta?: number }>
      if (ce?.detail && typeof ce.detail.delta === 'number') {
        setUnreadCount((prev) => Math.max(0, prev + (ce.detail.delta as number)))
      } else {
        void loadProfileAndUnread()
      }
    }
    window.addEventListener("medsplit:notifications-updated", handler as EventListener)
    return () => window.removeEventListener("medsplit:notifications-updated", handler as EventListener)
  }, [])

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "w-full" : "w-64")}>
      {/* Logo */}
      <div className="flex items-center space-x-2 p-6 border-b">
        <Heart className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-primary">MedSplit</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarImage src="/user-avatar.jpg" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName || "Your Profile"}</p>
            <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
          </div>
        </div>
        <Link href="/auth">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">MedSplit</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right side - User info and notifications */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <Link href="/profile" className="hidden md:flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                <Avatar>
                  <AvatarImage src="/user-avatar.jpg" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName || "Your Profile"}</p>
                  <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
                </div>
              </Link>

              {/* Notifications */}
              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-64">
                  <Sidebar mobile />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
