"use client"

import { useState, useEffect } from "react"
import { Plus, AlertCircle, UserRoundMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux"
import { getPenalties } from "./_action"
import { getMembers } from "@/app/home/members/_action"
import { AddPenaltyForm } from "@/components/penalties/add-penalty-form"
import { Penalty, Member } from "@/interfaces/interface"
import { toast } from "sonner"

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 sm:ml-auto">
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
                  <div>
                    <p className="font-medium">{getMemberName(penalty)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(penalty.createdAt)}
                    </p>
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
