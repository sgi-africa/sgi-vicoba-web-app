"use client"

import {
  Home,
  User2,
  ChevronUp,
  UsersRound,
  Wallet,
  HandCoins,
  ClipboardPenLine,
  BanknoteArrowUp,
  UserRoundMinus,
  Settings,
  Shield,
} from "lucide-react"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import LogoutButton from "@/components/auth/logout"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Session } from "next-auth"

const MENU_ITEMS = [
  { key: "home", url: "/home", icon: Home },
  { key: "memberRegistry", url: "/home/members", icon: UsersRound },
  { key: "contributionLedger", url: "/home/contributions", icon: Wallet },
  { key: "loansManagement", url: "/home/loans", icon: HandCoins },
  { key: "meetingsMinutes", url: "/home/meetings", icon: ClipboardPenLine },
  { key: "shares", url: "/home/shares", icon: BanknoteArrowUp },
  { key: "penalties", url: "/home/penalties", icon: UserRoundMinus },
  { key: "fundDisbursements", url: "/home/funds", icon: BanknoteArrowUp },
  { key: "settings", url: "/home/settings", icon: Settings },
] as const

interface AppSidebarContentProps {
  session: Session | null
}

export function AppSidebarContent({ session }: AppSidebarContentProps) {
  const { t } = useTranslation()
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader className="px-4 py-5">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="size-4" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
            SGI VICOBA
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[11px] font-medium uppercase tracking-wider px-3">
            {t("sidebar.navigation") ?? "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={t(`sidebar.${item.key}`)}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{t(`sidebar.${item.key}`)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
                    {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <span className="truncate text-sm">{session?.user?.name}</span>
                  <ChevronUp className="ml-auto size-4 shrink-0 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuItem className="p-0">
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}
