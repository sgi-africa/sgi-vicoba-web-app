import { Home, User2, ChevronUp, UsersRound, Wallet, HandCoins, ClipboardPenLine, BanknoteArrowUp, UserRoundMinus } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { auth } from "@/auth";
import LogoutButton from "@/components/auth/logout";
import Link from "next/link";
import Image from "next/image";

// Menu items.
const items = [
    {
        title: "Home",
        url: "/home",
        icon: Home,
    },
    {
        title: "Member Registry",
        url: "/home/members",
        icon: UsersRound,
    },
    {
        title: "Contribution Ledger",
        url: "/home/contributions",
        icon: Wallet,
    },
    {
        title: "Loans Management",
        url: "/home/loans",
        icon: HandCoins,
    },
    {
        title: "Meetings & Minutes",
        url: "/home/meetings",
        icon: ClipboardPenLine,
    },
    {
        title: "Shares",
        url: "/home/shares",
        icon: BanknoteArrowUp,
    },
    {
        title: "Penalties",
        url: "/home/penalties",
        icon: UserRoundMinus,
    },
]

export default async function AppSidebar() {

    const session = await auth();

    return (
        <Sidebar>
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
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title} className="mt-2">
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
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
                                    <span>{session?.user.name}</span>
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
        </Sidebar>
    )
}