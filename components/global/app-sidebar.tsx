import { Sidebar } from "@/components/ui/sidebar"
import { auth } from "@/auth"
import { AppSidebarContent } from "./app-sidebar-content"

export default async function AppSidebar() {
  const session = await auth()

  return (
    <Sidebar>
      <AppSidebarContent session={session} />
    </Sidebar>
  )
}