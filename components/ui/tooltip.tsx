"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string | React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delayDuration?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  side = "right",
  align = "center",
  delayDuration = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true)
    }, delayDuration)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  const getPositionClasses = () => {
    const positions = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
    }

    const alignments = {
      start: side === "top" || side === "bottom" ? "left-0 translate-x-0" : "top-0 translate-y-0",
      center: "",
      end: side === "top" || side === "bottom" ? "right-0 translate-x-0" : "bottom-0 translate-y-0",
    }

    return `${positions[side]} ${align !== "center" ? alignments[align] : ""}`
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in-0 zoom-in-95",
            getPositionClasses(),
            className
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 rotate-45",
              side === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
              side === "right" && "left-[-4px] top-1/2 -translate-y-1/2",
              side === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
              side === "left" && "right-[-4px] top-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </div>
  )
}
