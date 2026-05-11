"use client"

import { Activity, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface HeaderProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function Header({ activeSection, setActiveSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { id: "analysis", label: "Analysis", type: "section" as const },
    { id: "specialists", label: "Nearby Specialists", type: "section" as const },
    { id: "report", label: "Report", type: "section" as const },
    { id: "history", label: "History", type: "route" as const, href: "/history" },
  ]

  const handleNavClick = (item: (typeof navItems)[number]) => {
    if (item.type === "route") {
      router.push(item.href)
      setActiveSection(item.id)
      setMobileMenuOpen(false)
      return
    }

    if (pathname !== "/app") {
      router.push(`/app#${item.id}`)
      setActiveSection(item.id)
      setMobileMenuOpen(false)
      return
    }

    setActiveSection(item.id)
    const element = document.getElementById(item.id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.replace("/auth")
    } finally {
      setLoggingOut(false)
      setMobileMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            Skin Burn Detection
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.type === "route"
                  ? pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : pathname === "/app" && activeSection === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user?.email && (
            <span className="text-sm text-muted-foreground max-w-52 truncate">
              {user.displayName || user.email}
            </span>
          )}
          <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  item.type === "route"
                    ? pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : pathname === "/app" && activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-border space-y-3">
              {user?.email && (
                <p className="px-4 text-sm text-muted-foreground">
                  {user.displayName || user.email}
                </p>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
