import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600/90 text-white hover:bg-primary-600",
        secondary:
          "border-border-default bg-background-elevated text-text-secondary hover:bg-background-hover",
        destructive:
          "border-transparent bg-status-error/90 text-white hover:bg-status-error",
        success:
          "border-transparent bg-status-success/90 text-white hover:bg-status-success",
        warning:
          "border-transparent bg-status-warning/90 text-white hover:bg-status-warning",
        outline: "border-primary-600/30 bg-primary-600/5 text-primary-400 hover:bg-primary-600/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
