import { cn } from "@/lib/utils"

interface ContentContainerProps {
  children: React.ReactNode
  className?: string
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  return (
    <div className={cn("px-4 md:px-6 lg:px-8 pb-8", className)}>
      {children}
    </div>
  )
}
