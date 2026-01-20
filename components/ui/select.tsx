"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  return <div className={cn("relative", className)}>{children}</div>
}

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span>{placeholder}</span>
}

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  return <option value={value}>{children}</option>
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
}
