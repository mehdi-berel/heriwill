"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ComponentType } from "react"

interface WillCategory {
  id: string
  title: string
  description: string
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  completed: boolean
}

interface WillCategoriesProps {
  categories: WillCategory[]
  onCategorySelect: (categoryId: string) => void
}

export function WillCategories({ categories, onCategorySelect }: WillCategoriesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const Icon = category.icon
        
        return (
          <Card
            key={category.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg hover:border-primary-600/30",
              category.completed && "border-green-600/30 bg-green-600/5"
            )}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon 
                    className="h-6 w-6" 
                    style={{ color: category.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.title}
                    {category.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {category.description}
              </CardDescription>
              {category.completed && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ✓ Information saved
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
