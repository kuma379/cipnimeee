import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground shadow",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
      outline: "text-foreground border-border",
      accent: "border-transparent bg-accent/10 text-accent ring-1 ring-accent/20",
    },
  },
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants.variants.variant
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants.base, badgeVariants.variants.variant[variant], className)} {...props} />
  )
}

export { Badge, badgeVariants }
