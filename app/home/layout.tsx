import AppSidebar from "@/components/global/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { HomeHeader } from "@/components/home/home-header"

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HomeHeader />
        <main className="flex flex-1 flex-col min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
