import { LucideIcon } from "lucide-react"
import { Button } from "./button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-float">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-text-primary">{title}</h3>
      <p className="text-text-muted text-center mb-8 max-w-md">
        {description}
      </p>
      <div className="flex gap-3">
        {actionLabel && onAction && (
          <Button 
            onClick={onAction}
            className="shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transition-all"
          >
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button 
            onClick={onSecondaryAction}
            variant="outline"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
