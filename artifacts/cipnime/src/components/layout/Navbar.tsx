import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { Search, Menu, X, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [location, setLocation] = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Check if we're on a search page and pre-fill the query
  useEffect(() => {
    if (location.startsWith('/search')) {
      const query = new URLSearchParams(window.location.search).get('q')
      if (query) setSearchQuery(query)
    }
  }, [location])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Popular", href: "/search?q=popular" }, // Just a shortcut
  ]

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "glass py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <PlayCircle className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Cip<span className="text-primary">Nime</span>
            </span>
          </Link>

          {/* Desktop Nav & Search */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-8">
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <form onSubmit={handleSearch} className="relative w-full max-w-sm">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-secondary/50 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm"
                />
              </div>
            </form>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden z-50 p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/95 backdrop-blur-xl z-40 md:hidden transition-transform duration-300 flex flex-col pt-24 px-6",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-secondary border border-border pl-11 pr-4 py-4 text-base text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        <nav className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="text-2xl font-display font-semibold text-white/80 hover:text-white py-2 border-b border-white/5"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
