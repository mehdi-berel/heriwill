import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  onClose?: () => void
}

export function Toast({ type = 'info', title, description, onClose }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-status-success/10 border-status-success text-status-success',
    error: 'bg-status-error/10 border-status-error text-status-error',
    warning: 'bg-status-warning/10 border-status-warning text-status-warning',
    info: 'bg-status-info/10 border-status-info text-status-info',
  }

  const Icon = icons[type]

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border-l-4 animate-slide-up",
      colors[type]
    )}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium mb-1">{title}</p>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
