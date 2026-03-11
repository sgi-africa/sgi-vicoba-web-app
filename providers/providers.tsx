"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import "@/i18n"
import { Provider } from "react-redux"
import { store, persistor } from "@/store/store"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PersistGate } from "redux-persist/integration/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-center" richColors />
        </SessionProvider>
      </PersistGate>
    </Provider>
  )
}
