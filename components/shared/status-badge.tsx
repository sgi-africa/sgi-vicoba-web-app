import { cn } from "@/lib/utils"
import type { StatusBadgeProps } from "@/interfaces/interface"
import type { StatusVariant } from "@/interfaces/interface"

const VARIANT_STYLES: Record<StatusVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  error: "bg-destructive/10 text-destructive",
  default: "bg-muted text-muted-foreground",
}

export function StatusBadge({ label, variant = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
