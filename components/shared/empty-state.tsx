import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed border-border/60", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {description}
        </p>
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  )
}
