import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-background-elevated/50",
        className
      )}
      {...props}
    />
  )
}

export function VaultListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center p-4 bg-background-card border border-border rounded-xl"
        >
          <Skeleton className="w-12 h-12 rounded-full mr-3 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-background-card border border-border rounded-xl">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
