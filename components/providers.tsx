"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import "@/i18n"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-center" richColors />
    </SessionProvider>
  )
}
