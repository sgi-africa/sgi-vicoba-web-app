'use client'

import { useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wallet, Users, HandCoins, ClipboardList } from "lucide-react"
import GroupSelector from "./group-selector"
import { GroupResponse } from "@/interfaces/interface"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setActiveGroup } from "@/store/groupSlice"

const QUICK_ACTIONS = [
    { title: "Contributions", href: "/home/contributions", icon: Wallet },
    { title: "Loans", href: "/home/loans", icon: HandCoins },
    { title: "Meetings", href: "/home/meetings", icon: ClipboardList },
    { title: "Members", href: "/home/members", icon: Users },
]

export default function GroupDashboard({ groups }: { groups: GroupResponse[] }) {
    const dispatch = useAppDispatch()

    const selectedGroup = useAppSelector(
        (state) => state.group.activeGroup
    )

    // Set default active group if none exists
    useEffect(() => {
        if (!selectedGroup && groups.length > 0) {
            dispatch(setActiveGroup(groups[0]))
        }
    }, [groups, selectedGroup, dispatch])

    if (!selectedGroup) return <div>No groups found</div>

    return (
        <div className="flex flex-col flex-1 overflow-auto w-full">
            {/* Dashboard header */}
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <GroupSelector groups={groups} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 md:px-6 pb-6 w-full">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total group assets</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {/* TZS {selectedGroup.totalBalance} */}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Available cash</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            TZS {selectedGroup.totalBalance ?? 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total member savings</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {/* TZS {selectedGrou ?? 0} */}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Outstanding loans</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {/* TZS {selectedGroup. ?? 0} */}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex-1 px-4 md:px-6 pb-6 w-full min-w-0">
                <h3 className="text-lg font-semibold mb-4">Quick actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {QUICK_ACTIONS.map(({ title, href, icon: Icon }) => (
                        <a
                            key={href}
                            href={`${href}?groupId=${selectedGroup.id}`}
                            className="min-w-0"
                        >
                            <Card className="w-full h-full transition-colors hover:bg-accent/50 cursor-pointer">
                                <CardHeader className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-base font-medium truncate">{title}</CardTitle>
                                    </div>
                                </CardHeader>
                            </Card>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}