"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const DropdownMenu = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            onOpenChange: handleOpenChange,
          })
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, children, asChild, isOpen, onOpenChange, ...props }, ref) => {
  const handleClick = () => {
    onOpenChange?.(!isOpen)
  }

  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<any>
    return React.cloneElement(childElement, {
      ref,
      onClick: (e: React.MouseEvent) => {
        childElement.props.onClick?.(e)
        handleClick()
      },
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end"
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, children, align = "center", isOpen, onOpenChange, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onOpenChange?.(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onOpenChange])

  if (!isOpen) return null

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border border-border-default bg-background-primary p-1 shadow-lg animate-in fade-in-0 zoom-in-95",
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean
    disabled?: boolean
  }
>(({ className, children, asChild, disabled, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<any>
    return React.cloneElement(childElement, {
      className: cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-background-hover focus:bg-background-hover",
        "text-text-secondary hover:text-text-primary",
        disabled && "pointer-events-none opacity-50",
        childElement.props.className
      ),
    })
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-background-hover focus:bg-background-hover",
        "text-text-secondary hover:text-text-primary",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-1 h-px bg-border-default", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-text-tertiary", className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
DropdownMenuGroup.displayName = "DropdownMenuGroup"

const DropdownMenuSub = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen: open,
            onOpenChange: setOpen,
          })
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ className, children, isOpen, onOpenChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
      "hover:bg-background-hover focus:bg-background-hover",
      "text-text-secondary hover:text-text-primary",
      className
    )}
    onMouseEnter={() => onOpenChange?.(true)}
    onMouseLeave={() => onOpenChange?.(false)}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </div>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean
  }
>(({ className, children, isOpen, ...props }, ref) => {
  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-full top-0 z-50 ml-1 min-w-[12rem] overflow-hidden rounded-md border border-border-default bg-background-primary p-1 shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
