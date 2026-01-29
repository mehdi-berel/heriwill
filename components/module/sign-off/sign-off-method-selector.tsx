"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

interface SignOffMethod {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  badge?: string
  recommended?: boolean
}

interface SignOffMethodSelectorProps {
  methods: SignOffMethod[]
  selectedMethod: string | null
  onMethodSelect: (methodId: string) => void
}

export function SignOffMethodSelector({ 
  methods, 
  selectedMethod, 
  onMethodSelect 
}: SignOffMethodSelectorProps) {
  return (
    <div className="space-y-2">
      {methods.map((method) => {
        const Icon = method.icon
        const isSelected = selectedMethod === method.id
        
        return (
          <div
            key={method.id}
            className={cn(
              "group relative cursor-pointer transition-all duration-200 rounded-lg border p-3 hover:shadow-md",
              isSelected 
                ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 shadow-sm" 
                : "hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50/50 dark:hover:bg-gray-900/30"
            )}
            style={{ borderColor: isSelected ? undefined : '#232629' }}
            onClick={() => onMethodSelect(method.id)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{ 
                  backgroundColor: `${method.color}20`,
                  border: `1.5px solid ${method.color}40`
                }}
              >
                <Icon 
                  className="h-4.5 w-4.5"
                  style={{ color: method.color }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {method.title}
                  </h3>
                  {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                  )}
                  {method.recommended && !isSelected && (
                    <Badge className="bg-amber-500 text-white border-transparent text-xs py-0 px-1.5 h-4">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {method.description}
                </p>
              </div>
              
              {isSelected && (
                <Badge variant="secondary" className="text-xs flex-shrink-0 h-5">
                  Active
                </Badge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
