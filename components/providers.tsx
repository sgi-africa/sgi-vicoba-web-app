"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import "@/i18n"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
      <Toaster position="top-center" richColors />
    </SessionProvider>
  )
}
