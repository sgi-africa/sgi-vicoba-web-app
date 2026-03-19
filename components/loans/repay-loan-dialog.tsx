"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
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
import { LoanRequest } from "@/interfaces/interface"

export interface RepayLoanDialogProps {
  loan: LoanRequest
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function RepayLoanDialog({ loan, onSuccess, trigger }: RepayLoanDialogProps) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState("")
  const [open, setOpen] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Call server action to record repayment
    // await repayLoan(loan.id, Number(amount))
    onSuccess?.()
    setOpen(false)
    setAmount("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div className="space-y-2">
            <Label htmlFor={`repay-amount-${loan.id}`}>
              {t("loans.principalTzs")}
            </Label>
            <Input
              id={`repay-amount-${loan.id}`}
              type="number"
              min={0}
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10"
            />
          </div>
          <DialogFooter className="gap-3 sm:gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit">{t("loans.submitRepay")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
