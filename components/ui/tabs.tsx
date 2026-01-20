"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange })
        }
        return child
      })}
    </div>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      data-state={value === value ? "active" : "inactive"}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      data-state={value === value ? "active" : "inactive"}
    >
      {value === value && children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
