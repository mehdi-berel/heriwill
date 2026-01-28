import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-250 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#9333EA] via-[#A855F7] to-[#9333EA] bg-[length:200%_100%] text-white hover:bg-[position:100%_0] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_12px_-2px_rgba(147,51,234,0.25),0_2px_6px_-1px_rgba(147,51,234,0.15)] hover:shadow-[0_12px_24px_-4px_rgba(147,51,234,0.3),0_4px_12px_-2px_rgba(147,51,234,0.2)] focus:shadow-[0_0_0_3px_rgba(147,51,234,0.4),0_4px_12px_-2px_rgba(147,51,234,0.25)]",
        destructive:
          "bg-status-error text-white hover:bg-status-error/90 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_12px_-2px_rgba(239,68,68,0.25)] hover:shadow-[0_12px_24px_-4px_rgba(239,68,68,0.3)]",
        outline:
          "border-[1.5px] border-primary-600/20 bg-primary-600/5 text-primary-400 hover:bg-primary-600/12 hover:border-primary-600/40 hover:text-primary-300 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_8px_16px_-4px_rgba(147,51,234,0.15)]",
        secondary:
          "bg-background-elevated border border-border-default text-text-secondary hover:bg-background-hover hover:text-text-primary hover:border-border-light hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md",
        ghost: "hover:bg-background-hover hover:text-text-primary hover:-translate-y-0.5 active:translate-y-0",
        link: "text-primary-400 underline-offset-4 hover:text-primary-300 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
