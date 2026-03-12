'use client'

import { useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Wallet, Users, HandCoins, ClipboardList } from "lucide-react"
import GroupSelector from "./group-selector"
import { CreateGroupDialog } from "./create-group-dialog"
import { GroupResponse } from "@/interfaces/interface"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setGroups, addGroup, setActiveGroup } from "@/store/groupSlice"
import { cn } from "@/lib/utils"

const QUICK_ACTIONS = [
    { title: "Contributions", href: "/home/contributions", icon: Wallet },
    { title: "Loans", href: "/home/loans", icon: HandCoins },
    { title: "Meetings", href: "/home/meetings", icon: ClipboardList },
    { title: "Members", href: "/home/members", icon: Users },
]

export default function GroupDashboard({ groups }: { groups: GroupResponse[] }) {
    const dispatch = useAppDispatch()
    const reduxGroups = useAppSelector((state) => state.group.groups)
    const selectedGroup = useAppSelector((state) => state.group.activeGroup)

    // Sync server groups to Redux on mount / when groups prop changes
    useEffect(() => {
        if (groups.length > 0) {
            dispatch(setGroups(groups))
        }
    }, [groups, dispatch])

    const effectiveGroups = reduxGroups.length > 0 ? reduxGroups : groups
    const hasGroups = effectiveGroups.length > 0

    // Set default active group if none exists
    useEffect(() => {
        if (!selectedGroup && effectiveGroups.length > 0) {
            dispatch(setActiveGroup(effectiveGroups[0]))
        }
    }, [effectiveGroups, selectedGroup, dispatch])

    function handleGroupCreated(createdGroup: GroupResponse) {
        dispatch(addGroup(createdGroup))
        dispatch(setActiveGroup(createdGroup))
    }

    return (
        <div className="flex flex-col flex-1 overflow-auto w-full">
            {/* Dashboard header */}
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center gap-2">
                    {hasGroups && <GroupSelector groups={effectiveGroups} />}
                    <CreateGroupDialog
                        variant="default"
                        onSuccess={handleGroupCreated}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 md:px-6 pb-6 w-full">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total group assets</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            TZS {selectedGroup?.totalBalance ?? 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Available cash</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            TZS {selectedGroup?.totalBalance ?? 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total member savings</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            TZS 0
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Outstanding loans</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            TZS 0
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex-1 px-4 md:px-6 pb-6 w-full min-w-0">
                <h3 className="text-lg font-semibold mb-4">Quick actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {QUICK_ACTIONS.map(({ title, href, icon: Icon }) => {
                        const canNavigate = hasGroups && selectedGroup
                        const Wrapper = canNavigate ? "a" : "div"
                        const wrapperProps = canNavigate
                            ? { href }
                            : { className: "pointer-events-none" }

                        return (
                            <Wrapper
                                key={href}
                                {...wrapperProps}
                                className={cn("min-w-0", !canNavigate && "opacity-60")}
                            >
                                <Card
                                    className={cn(
                                        "w-full h-full transition-colors cursor-not-allowed",
                                        canNavigate && "hover:bg-accent/50 cursor-pointer"
                                    )}
                                >
                                    <CardHeader className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <CardTitle className="text-base font-medium truncate">{title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Wrapper>
                        )
                    })}
                </div>
                {!hasGroups && (
                    <Card className="border-dashed mt-4">
                        <CardContent className="flex flex-col items-center justify-center py-10 px-6">
                            <div className="rounded-full bg-muted p-3 mb-3">
                                <Users className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold mb-1">No groups yet</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                Create your first group to access contributions, loans, meetings, and members.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}