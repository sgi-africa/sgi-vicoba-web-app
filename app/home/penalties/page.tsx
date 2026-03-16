"use client"

import { useState, useEffect } from "react"
import { Plus, AlertCircle, UserRoundMinus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux"
import { getPenalties } from "./_action"
import { getMembers } from "@/app/home/members/_action"
import { AddPenaltyForm } from "@/components/penalties/add-penalty-form"
import { Penalty, Member } from "@/interfaces/interface"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return dateStr
  }
}

function getMemberName(penalty: Penalty): string {
  if (penalty.user) {
    return `${penalty.user.firstName} ${penalty.user.lastName}`
  }
  return "Unknown member"
}

function formatPenaltyType(type: string): string {
  if (!type) return "Other"
  return type.charAt(0) + type.slice(1).toLowerCase()
}

export default function PenaltiesPage() {
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const groupId = activeGroup?.id

  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      try {
        const [pens, mems] = await Promise.all([
          getPenalties(groupId),
          getMembers(groupId),
        ])
        if (!cancelled) {
          setPenalties(pens)
          setMembers(mems)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [groupId])

  const handleAddSuccess = async () => {
    if (!groupId) return
    const [pens, mems] = await Promise.all([
      getPenalties(groupId),
      getMembers(groupId),
    ])
    setPenalties(pens)
    setMembers(mems)
    setOpen(false)
    toast.success("Penalty added successfully")
  }

  const totalAmount = penalties.reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const totalPaid = penalties
    .filter((p) => p.status?.toUpperCase() === "PAID")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
  const totalUnpaid = penalties
    .filter((p) => p.status?.toUpperCase() !== "PAID")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)

  function handleDownloadPenalties() {
    if (!activeGroup || penalties.length === 0) return

    const doc = new jsPDF()
    const groupName = activeGroup.name
    const date = new Date().toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.setFontSize(18)
    doc.text("Penalties Ledger", 14, 20)
    doc.setFontSize(12)
    doc.text(groupName, 14, 28)
    doc.text(date, 14, 34)

    autoTable(doc, {
      startY: 42,
      head: [["Member", "Date", "Type", "Amount", "Status"]],
      body: penalties.map((p) => [
        getMemberName(p),
        formatDate(p.createdAt),
        formatPenaltyType(p.type ?? "OTHER"),
        formatAmount(p.amount),
        p.status?.toUpperCase() === "PAID" ? "Paid" : "Unpaid",
      ]),
      theme: "striped",
    })

    const tableEndY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 42
    autoTable(doc, {
      startY: tableEndY + 10,
      head: [["Summary", "Amount"]],
      body: [
        ["Total penalties", formatAmount(totalAmount)],
        ["Paid", formatAmount(totalPaid)],
        ["Unpaid", formatAmount(totalUnpaid)],
      ],
      theme: "plain",
    })

    doc.save(`${groupName.replace(/\s+/g, "-")}-penalties-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (!activeGroup || !groupId) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <UserRoundMinus className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No group selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Select a group from the dashboard to view penalties.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Penalties Ledger
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {penalties.length}{" "}
            {penalties.length === 1 ? "penalty" : "penalties"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {penalties.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer shrink-0"
              onClick={handleDownloadPenalties}
              title="Download penalties"
            >
              <Download className="size-4" />
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 cursor-pointer">
                <Plus className="size-4" />
                Add penalty
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add penalty</DialogTitle>
              </DialogHeader>
              <AddPenaltyForm
                groupId={groupId}
                members={members}
                onSuccess={handleAddSuccess}
                onClose={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 md:px-6 pb-4">
        {isLoading ? (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-28 bg-muted rounded animate-pulse mt-2" />
              </CardHeader>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-28 bg-muted rounded animate-pulse mt-2" />
              </CardHeader>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-28 bg-muted rounded animate-pulse mt-2" />
              </CardHeader>
            </Card>
          </>
        ) : (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription>Total penalties</CardDescription>
                <CardTitle className="text-xl font-bold">
                  {formatAmount(totalAmount)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription>Paid</CardDescription>
                <CardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatAmount(totalPaid)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription>Unpaid</CardDescription>
                <CardTitle className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatAmount(totalUnpaid)}
                </CardTitle>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

      <div className="flex-1 px-4 md:px-6 pb-6">
        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-sm text-muted-foreground">Loading penalties…</p>
            </CardContent>
          </Card>
        ) : penalties.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No penalties yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Record your first penalty by clicking the &quot;Add
                penalty&quot; button above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {penalties.map((penalty) => (
              <Card
                key={penalty.id}
                className="transition-colors hover:bg-accent/30 cursor-default"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {getMemberName(penalty)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{getMemberName(penalty)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(penalty.createdAt)} · {formatPenaltyType(penalty.type ?? "OTHER")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-primary">
                      {formatAmount(penalty.amount)}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${penalty.status?.toUpperCase() === "PAID"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        }`}
                    >
                      {penalty.status?.toUpperCase() === "PAID" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
