"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SearchInputProps } from "@/interfaces/interface"

export function SearchInput({ value, onChange, placeholder = "Search...", ariaLabel }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-10 bg-card border-border/60 focus-visible:ring-primary/30"
        aria-label={ariaLabel ?? placeholder}
      />
    </div>
  )
}
