import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border-default bg-background-card/40 backdrop-blur-sm px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary focus-visible:outline-none focus-visible:border-primary-600/50 focus-visible:ring-2 focus-visible:ring-primary-600/10 hover:border-border-light disabled:cursor-not-allowed disabled:opacity-50 autofill:bg-background-card/40 autofill:text-text-primary autofill:shadow-[inset_0_0_0px_1000px_rgb(var(--background-card))]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
