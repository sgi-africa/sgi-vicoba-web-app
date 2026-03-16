"use client"

import { Home, User2, ChevronUp, UsersRound, Wallet, HandCoins, ClipboardPenLine, BanknoteArrowUp, UserRoundMinus, Settings } from "lucide-react"
import { SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import LogoutButton from "@/components/auth/logout"
import Link from "next/link"
import Image from "next/image"
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

  return (
    <>
      <SidebarContent>
        <SidebarGroup>
          <div className="w-32 h-32 rounded-full overflow-hidden mx-auto my-4">
            <Image
              src="/logo.jpg"
              width={128}
              height={128}
              alt="Dashboard Image"
              className="object-cover w-full h-full"
            />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.key} className="mt-2">
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(`sidebar.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <User2 className="mr-2" />
                  <span>{session?.user?.name}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-full">
                <DropdownMenuItem>
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
