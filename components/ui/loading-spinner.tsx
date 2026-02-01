import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ 
  size = "md", 
  text = "Loading...",
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  const containerClass = fullScreen 
    ? "min-h-screen flex flex-col items-center justify-center gap-4"
    : "flex flex-col items-center justify-center gap-4 p-8"

  return (
    <div className={containerClass} style={{ backgroundColor: fullScreen ? '#09090B' : 'transparent' }}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin`} 
        style={{ color: '#C084FC' }} 
      />
      {text && (
        <p className={`${textSizeClasses[size]}`} style={{ color: '#A1A1AA' }}>
          {text}
        </p>
      )}
    </div>
  )
}
