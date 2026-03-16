import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface SummaryCardProps {
  label: string
  value: string
  icon?: LucideIcon
  iconClassName?: string
  valueClassName?: string
  className?: string
}

export function SummaryCard({ label, value, icon: Icon, iconClassName, valueClassName, className }: SummaryCardProps) {
  return (
    <Card className={cn("shadow-sm border-border/60", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", iconClassName)}>
              <Icon className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              {label}
            </CardDescription>
            <CardTitle className={cn("text-xl font-bold mt-0.5", valueClassName)}>
              {value}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

export function SummaryCardSkeleton() {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-6 w-28 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
