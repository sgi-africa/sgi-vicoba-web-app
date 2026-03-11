import AppSidebar from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { HomeHeader } from "@/components/home-header"

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col min-w-0">
        <HomeHeader />
        {children}
      </main>
    </SidebarProvider>
  )
}
