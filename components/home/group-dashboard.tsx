'use client'

import {
    useEffect,
    // useMemo, 
    useState
} from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Wallet, Users, HandCoins, ClipboardList, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import GroupSelector from "./group-selector"
import { CreateGroupDialog } from "./create-group-dialog"
import { GroupResponse } from "@/interfaces/interface"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setGroups, addGroup, setActiveGroup } from "@/store/groupSlice"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getContributions } from "@/app/home/contributions/_action"
import { getLoans } from "@/app/home/loans/_action"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { useTranslation } from "react-i18next"

function formatAmount(amount: number | string) {
    return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: "TZS",
        minimumFractionDigits: 0,
    }).format(Number(amount))
}

const QUICK_ACTION_KEYS = [
    { key: "contributions", href: "/home/contributions", icon: Wallet },
    { key: "loans", href: "/home/loans", icon: HandCoins },
    { key: "meetings", href: "/home/meetings", icon: ClipboardList },
    { key: "members", href: "/home/members", icon: Users },
] as const

export default function GroupDashboard({ groups }: { groups: GroupResponse[] }) {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const selectedGroup = useAppSelector((state) => state.group.activeGroup)
    const reduxGroups = useAppSelector((state) => state.group.groups)
    const [totalMemberSavings, setTotalMemberSavings] = useState<number>(0)
    const [outstandingLoansTotal, setOutstandingLoansTotal] = useState<number>(0)

    // All summary data from API: groups from server (page), totals from groups prop, savings from getContributions
    // const totalGroupAssets = useMemo(
    //     () =>
    //         groups.reduce(
    //             (sum, g) => sum + Number(g.totalBalance ?? 0),
    //             0
    //         ),
    //     [groups]
    // )

    // Keep Redux in sync with server for context (which group we're on); card figures still come from API only
    useEffect(() => {
        if (groups.length > 0) {
            dispatch(setGroups(groups))
        }
    }, [groups, dispatch])

    // After creating a group, props may still be [] until server refetches; use Redux as fallback so the new group shows immediately
    const effectiveGroups = groups.length > 0 ? groups : reduxGroups
    const hasGroups = effectiveGroups.length > 0
    // Resolve selected group from effective list (API first, then Redux fallback)
    const selectedGroupFromApi =
        selectedGroup && effectiveGroups.length > 0
            ? effectiveGroups.find((g) => g.id === selectedGroup.id) ?? effectiveGroups[0]
            : effectiveGroups[0] ?? null


    // Set default active group if none exists (use effective list so Redux fallback works after create)
    useEffect(() => {
        const list = groups.length > 0 ? groups : reduxGroups
        if (!selectedGroup && list.length > 0) {
            dispatch(setActiveGroup(list[0]))
        }
    }, [groups, reduxGroups, selectedGroup, dispatch])

    // Get total member savings
    useEffect(() => {
        const groupId = selectedGroupFromApi?.id
        let cancelled = false

        void (async () => {
            if (!groupId) {
                if (!cancelled) setTotalMemberSavings(0)
                return
            }
            try {
                const contributions = await getContributions(groupId)
                if (cancelled) return
                const sum = contributions.reduce(
                    (acc, c) => acc + Number(c.amount ?? 0),
                    0
                )
                setTotalMemberSavings(sum)
            } catch {
                if (!cancelled) setTotalMemberSavings(0)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [selectedGroupFromApi?.id])

    // Get outstanding loans total
    useEffect(() => {
        const groupId = selectedGroupFromApi?.id
        let cancelled = false

        void (async () => {
            if (!groupId) {
                if (!cancelled) setOutstandingLoansTotal(0)
                return
            }
            try {
                const loans = await getLoans(groupId)
                if (cancelled) return
                const total = loans
                    .filter((loan) => loan.status === "PENDING" || loan.status === "OVERDUE")
                    .reduce((sum, loan) => sum + Number(loan.principal ?? 0), 0)
                setOutstandingLoansTotal(total)
            } catch {
                if (!cancelled) setOutstandingLoansTotal(0)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [selectedGroupFromApi?.id])

    function handleGroupCreated(createdGroup: GroupResponse) {
        dispatch(addGroup(createdGroup))
        dispatch(setActiveGroup(createdGroup))
    }

    function handleDownloadSummary() {
        if (!selectedGroupFromApi) return

        const doc = new jsPDF()
        const groupName = selectedGroupFromApi.name
        const date = new Date().toLocaleDateString("en-TZ", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })

        doc.setFontSize(18)
        doc.text(t("dashboard.title") + " Summary", 14, 20)
        doc.setFontSize(12)
        doc.text(groupName, 14, 28)
        doc.text(date, 14, 34)

        autoTable(doc, {
            startY: 42,
            head: [["Metric", "Value"]],
            body: [
                [t("dashboard.totalGroupAssets"), formatAmount(selectedGroupFromApi.totalBalance ?? 0)],
                [t("dashboard.availableCash"), formatAmount(selectedGroupFromApi.totalBalance ?? 0)],
                [t("dashboard.totalMemberSavings"), formatAmount(totalMemberSavings)],
                [t("dashboard.outstandingLoans"), formatAmount(outstandingLoansTotal)],
            ],
            theme: "striped",
        })

        doc.save(`${groupName.replace(/\s+/g, "-")}-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`)
    }

    return (
        <div className="flex flex-col flex-1 overflow-auto w-full">
            {/* Dashboard header */}
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h2>
                    {hasGroups && selectedGroupFromApi && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 cursor-pointer"
                            onClick={handleDownloadSummary}
                        >
                            <Download className="size-4" />
                        </Button>
                    )}
                </div>
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
                        <CardDescription>{t("dashboard.totalGroupAssets")}</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {/* {formatAmount(totalGroupAssets)} */}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t("dashboard.availableCash")}</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {formatAmount(selectedGroupFromApi?.totalBalance ?? 0)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t("dashboard.totalMemberSavings")}</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {formatAmount(totalMemberSavings)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t("dashboard.outstandingLoans")}</CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {formatAmount(outstandingLoansTotal)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex-1 px-4 md:px-6 pb-6 w-full min-w-0">
                <h3 className="text-lg font-semibold mb-4">{t("dashboard.quickActions")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {QUICK_ACTION_KEYS.map(({ key, href, icon: Icon }) => {
                        const canNavigate = hasGroups && selectedGroupFromApi
                        const card = (
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
                                        <CardTitle className="text-base font-medium truncate">{t(`dashboard.${key}`)}</CardTitle>
                                    </div>
                                </CardHeader>
                            </Card>
                        )

                        return canNavigate ? (
                            <Link
                                key={href}
                                href={href}
                                className={cn("min-w-0")}
                            >
                                {card}
                            </Link>
                        ) : (
                            <div
                                key={href}
                                className={cn("min-w-0 opacity-60 pointer-events-none")}
                            >
                                {card}
                            </div>
                        )
                    })}
                </div>
                {!hasGroups && (
                    <Card className="border-dashed mt-4">
                        <CardContent className="flex flex-col items-center justify-center py-10 px-6">
                            <div className="rounded-full bg-muted p-3 mb-3">
                                <Users className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold mb-1">{t("dashboard.noGroupsYet")}</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                {t("dashboard.createFirstGroup")}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}