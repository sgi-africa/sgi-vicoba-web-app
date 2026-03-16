"use client"

import { useState } from "react"
import { Banknote, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux"

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-TZ", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

// Placeholder type – replace with backend type when API is ready
interface FundDisbursement {
  id: number
  amount: string
  purpose: string
  recipient: string
  disbursedAt: string
  disbursedBy: string
}

export default function FundsPage() {
  const activeGroup = useAppSelector((state) => state.group.activeGroup)
  const [disbursements] = useState<FundDisbursement[]>([])

  const totalBalance = Number(activeGroup?.totalBalance ?? 0)
  const hasFunds = totalBalance > 0
  const hasDisbursements = disbursements.length > 0

  // Scenario 1: No group selected
  if (!activeGroup) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Banknote className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No group selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Select a group from the dashboard to view and manage fund disbursements.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fund Disbursements</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {disbursements.length}{" "}
            {disbursements.length === 1 ? "disbursement" : "disbursements"} recorded
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 md:px-6 pb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available balance</CardDescription>
            <CardTitle className="text-xl font-bold">
              {formatAmount(totalBalance)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total disbursed</CardDescription>
            <CardTitle className="text-xl font-bold">
              {formatAmount(
                disbursements.reduce((sum, d) => sum + Number(d.amount ?? 0), 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 md:px-6 pb-6">
        {/* Scenario 2: No funds allocated (balance is 0 and no disbursements) */}
        {!hasFunds && !hasDisbursements ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Wallet className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No funds allocated yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                This group has no available balance. Record contributions first to build up
                funds before making disbursements.
              </p>
            </CardContent>
          </Card>
        ) : !hasDisbursements ? (
          /* Scenario 2b: Has balance but no disbursements yet */
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Banknote className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No disbursements yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                You have {formatAmount(totalBalance)} available. Disbursement actions will
                appear here once you record your first payout.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Scenario 3: Funds available – show disbursement list */
          <div className="space-y-2">
            {disbursements.map((d) => (
              <Card
                key={d.id}
                className="transition-colors hover:bg-accent/30 cursor-default"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Banknote className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{d.purpose}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {d.recipient}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        {formatDate(d.disbursedAt)} · by {d.disbursedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-semibold text-primary">
                      {formatAmount(d.amount)}
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
