"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  LoanRepaymentSummary,
  LoanRequest,
  LoanStatus,
} from "@/interfaces/interface"
import { repayLoan } from "@/app/home/loans/_action"

export interface RepayLoanDialogProps {
  loan: LoanRequest
  /** Called with the API `LoanRepaymentSummary` after a successful repay */
  onSuccess?: (summary: LoanRepaymentSummary) => void
  trigger?: React.ReactNode
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { message?: string } } }).response
    const msg = res?.data?.message
    if (typeof msg === "string" && msg.trim()) return msg
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function RepayLoanDialog({ loan, onSuccess, trigger }: RepayLoanDialogProps) {
  const { t } = useTranslation()
  const isFullyPaid = loan.status === LoanStatus.PAID
  const [amount, setAmount] = useState("")
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setAmount("")
    setError(null)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) resetForm()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isFullyPaid) return
    setError(null)

    const parsed = Number(amount)
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError(t("loans.repayAmountInvalid"))
      return
    }

    setIsPending(true)
    try {
      const summary = await repayLoan(loan.groupId, loan.id, parsed)
      toast.success(t("notifications.loanRepaid"))
      onSuccess?.(summary)
      setOpen(false)
      resetForm()
    } catch (err) {
      setError(extractErrorMessage(err, t("loans.repayFailed")))
    } finally {
      setIsPending(false)
    }
  }

  if (isFullyPaid) {
    if (trigger) {
      return (
        <span
          className="inline-flex cursor-not-allowed rounded-full opacity-60"
          title={t("loans.repayDisabledPaid")}
          aria-label={t("loans.repayDisabledPaid")}
        >
          <span className="pointer-events-none">{trigger}</span>
        </span>
      )
    }
    return (
      <Button
        type="button"
        disabled
        size="sm"
        variant="ghost"
        title={t("loans.repayDisabledPaid")}
        aria-label={t("loans.repayDisabledPaid")}
        className="h-auto gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-muted/60 text-muted-foreground opacity-80"
      >
        {t("loans.repay")}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            size="sm"
            variant="ghost"
            className="h-auto gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
          >
            {t("loans.repay")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("loans.repayTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor={`repay-amount-${loan.id}`}>
              {t("loans.principalTzs")}
            </Label>
            <Input
              id={`repay-amount-${loan.id}`}
              type="number"
              min={0}
              step="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10"
              disabled={isPending}
              aria-invalid={!!error}
            />
          </div>
          <DialogFooter className="gap-3 sm:gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("loans.submittingRepay")}
                </>
              ) : (
                t("loans.submitRepay")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
