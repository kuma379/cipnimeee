import { Link } from "wouter"
import { AlertTriangle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="relative z-10 glass-card p-10 rounded-3xl max-w-md w-full text-center border-white/10 shadow-2xl">
        <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        
        <h1 className="text-5xl font-display font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-medium text-white/90 mb-6">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Button asChild className="w-full rounded-xl" size="lg">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
