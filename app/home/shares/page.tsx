"use client"

import { useState, useEffect } from "react"
import { Banknote, Coins, ShoppingCart, Info, BanknoteArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useAppSelector, useAppDispatch } from "@/hooks/redux"
import { markSharesConfigured } from "@/store/groupSlice"
import { AddSharesModal } from "@/components/shares/add-shares-modal"
import { SellSharesModal } from "@/components/shares/sell-shares-modal"
import { getGroupShares, getMemberShares } from "./_action"
import { getMembers } from "@/app/home/members/_action"
import { toast } from "sonner"
import { MemberSharesRow } from "@/interfaces/interface"


function formatAmount(amount: number | string) {
    return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: "TZS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(amount))
}

export default function SharesPage() {
    const dispatch = useAppDispatch()
    const activeGroup = useAppSelector((state) => state.group.activeGroup)
    const sharesConfiguredGroupIds = useAppSelector((state) => state.group.sharesConfiguredGroupIds)
    const groupId = activeGroup?.id

    const hasSharesConfigured = groupId ? sharesConfiguredGroupIds.includes(groupId) : false

    const [shares, setShares] = useState<{ sharePrice: string; availableShares: number } | null>(null)
    const [memberShares, setMemberShares] = useState<MemberSharesRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isTableLoading, setIsTableLoading] = useState(true)

    useEffect(() => {
        if (!groupId) return
        let cancelled = false
        void (async () => {
            setIsLoading(true)
            try {
                const data = await getGroupShares(groupId)
                if (!cancelled && data) {
                    setShares({
                        sharePrice: data.group.sharePrice ?? "0",
                        availableShares: data.availableShares ?? 0,
                    })
                    if (data.group.totalShares > 0) {
                        dispatch(markSharesConfigured(groupId))
                    }
                } else if (!cancelled) {
                    setShares({ sharePrice: "0", availableShares: 0 })
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [groupId, dispatch])

    useEffect(() => {
        if (!groupId) return
        let cancelled = false
        void (async () => {
            setIsTableLoading(true)
            try {
                const members = await getMembers(groupId)
                const results = await Promise.all(
                    members.map(async (member) => {
                        const data = await getMemberShares(groupId, member.userId)
                        return {
                            userId: member.userId,
                            name: `${member.user.firstName} ${member.user.lastName}`,
                            totalShares: data?.totalShares ?? 0,
                        }
                    })
                )
                if (!cancelled) setMemberShares(results)
            } finally {
                if (!cancelled) setIsTableLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [groupId])

    const handleAddSuccess = async () => {
        if (!groupId) return
        dispatch(markSharesConfigured(groupId))
        const [groupData, members] = await Promise.all([
            getGroupShares(groupId),
            getMembers(groupId),
        ])
        if (groupData) {
            setShares({
                sharePrice: groupData.group.sharePrice ?? "0",
                availableShares: groupData.availableShares ?? 0,
            })
        }
        const memberResults = await Promise.all(
            members.map(async (member) => {
                const data = await getMemberShares(groupId, member.userId)
                return {
                    userId: member.userId,
                    name: `${member.user.firstName} ${member.user.lastName}`,
                    totalShares: data?.totalShares ?? 0,
                }
            })
        )
        setMemberShares(memberResults)
        toast.success("Shares added successfully")
    }

    const handleSellSuccess = async () => {
        if (!groupId) return
        const [groupData, members] = await Promise.all([
            getGroupShares(groupId),
            getMembers(groupId),
        ])
        if (groupData) {
            setShares({
                sharePrice: groupData.group.sharePrice ?? "0",
                availableShares: groupData.availableShares ?? 0,
            })
        }
        const memberResults = await Promise.all(
            members.map(async (member) => {
                const data = await getMemberShares(groupId, member.userId)
                return {
                    userId: member.userId,
                    name: `${member.user.firstName} ${member.user.lastName}`,
                    totalShares: data?.totalShares ?? 0,
                }
            })
        )
        setMemberShares(memberResults)
        toast.success("Shares sold successfully")
    }

    if (!activeGroup || !groupId) {
        return (
            <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <BanknoteArrowUp className="size-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No group selected</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                            Select a group from the dashboard to view shares.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const availableShares = shares?.availableShares ?? 0
    const sharePrice = shares?.sharePrice ?? "0"

    return (
        <div className="flex flex-col flex-1 overflow-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 md:px-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Shares</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage group shares and pricing
                    </p>
                </div>
                {hasSharesConfigured ? (
                    <SellSharesModal
                        groupId={groupId}
                        members={memberShares.map((m) => ({ userId: m.userId, name: m.name }))}
                        onSuccess={handleSellSuccess}
                        trigger={
                            <Button size="sm" className="gap-2 cursor-pointer">
                                <ShoppingCart className="size-4" />
                                Sell shares
                            </Button>
                        }
                    />
                ) : (
                    <AddSharesModal
                        groupId={groupId}
                        onSuccess={handleAddSuccess}
                        variant="default"
                    />
                )}
            </div>

            {/* Banner to inform the user that once shares are configured for a group, total shares and share price cannot be edited or changed. */}
            <div className="px-4 md:px-6 pb-4">
                <Card className="border-muted-foreground/20 bg-muted/30">
                    <CardContent className="flex items-start gap-3 py-4">
                        <Info className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                            Once shares are configured for this group, total shares and share price cannot be edited or changed.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 md:px-6 pb-6">
                {isLoading ? (
                    <>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 shrink-0 rounded-xl bg-muted animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 shrink-0 rounded-xl bg-muted animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Coins className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardDescription>Share price</CardDescription>
                                        <CardTitle className="text-2xl font-bold">
                                            {formatAmount(sharePrice)}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">Per share</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <Banknote className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardDescription>Shares available</CardDescription>
                                        <CardTitle className="text-2xl font-bold">
                                            {availableShares.toLocaleString()}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">Total for this group</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </>
                )}
            </div>

            {/* Member shares table */}
            <div className="px-4 md:px-6 pb-6">
                <h3 className="text-lg font-semibold mb-4">Shares by member</h3>
                {isTableLoading ? (
                    <Card>
                        <div className="p-8 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                            ))}
                        </div>
                    </Card>
                ) : memberShares.length === 0 ? (
                    <Card>
                        <div className="p-8 text-center text-muted-foreground">
                            No members in this group yet.
                        </div>
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left px-6 py-4 font-medium">Member</th>
                                        <th className="text-right px-6 py-4 font-medium">Shares purchased</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberShares.map((row) => (
                                        <tr key={row.userId} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="px-6 py-4">{row.name}</td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {row.totalShares.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
