"use client"

import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import {
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { addLoanSchema } from "@/lib/zod"
import { AddLoanFormProps } from "@/interfaces/interface"
import { addLoan } from "@/app/home/loans/_action"
import { Loader2 } from "lucide-react"

// Simple interest: I = P × R × T / 100 (T in years). With T in months: I = P × R × (months/12) / 100
function simpleInterest(principal: number, ratePercent: number, durationMonths: number): number {
  const years = durationMonths / 12
  return (principal * ratePercent * years) / 100
}

function formatTzs(amount: number) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function AddLoanForm({
  groupId,
  members,
  onSuccess,
  onClose,
}: AddLoanFormProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [principal, setPrincipal] = useState<string>("")
  const [interestRate, setInterestRate] = useState<string>("")
  const [durationMonths, setDurationMonths] = useState<string>("")

  const { interest, totalRepayment, hasValidInputs } = useMemo(() => {
    const P = Number(principal)
    const R = Number(interestRate)
    const T = Number(durationMonths)
    const valid = P > 0 && R > 0 && T >= 1
    const interestAmount = valid ? simpleInterest(P, R, T) : 0
    const total = valid ? P + interestAmount : 0
    return {
      interest: interestAmount,
      totalRepayment: total,
      hasValidInputs: valid,
    }
  }, [principal, interestRate, durationMonths])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const reasonInput = (form.elements.namedItem("reason") as HTMLTextAreaElement).value.trim()

    const rawFormData = {
      userId,
      principal,
      interestRate,
      durationMonths,
      reason: reasonInput || undefined,
    }

    const result = addLoanSchema.safeParse(rawFormData)

    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0]?.toString() ?? "form"
        if (!errors[path]) errors[path] = issue.message
      }
      setFieldErrors(errors)
      setIsPending(false)
      return
    }

    try {
      await addLoan(groupId, {
        userId: result.data.userId,
        principal: result.data.principal,
        interestRate: result.data.interestRate,
        durationMonths: result.data.durationMonths,
        reason: result.data.reason,
      })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      let message = "Failed to add loan"
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response
        message = res?.data?.message ?? message
      } else if (err instanceof Error) {
        message = err.message
      }
      setError(message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="userId">{t("loans.memberBorrower")}</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger id="userId" aria-invalid={!!fieldErrors.userId}>
            <SelectValue placeholder={t("common.selectMember")} />
          </SelectTrigger>
          <SelectContent>
            {members.map((member) => (
              <SelectItem
                key={member.id}
                value={String(member.userId)}
              >
                {member.user.firstName} {member.user.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.userId && (
          <p className="text-sm text-destructive">{fieldErrors.userId}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2 min-w-0">
          <Label htmlFor="principal">{t("loans.principalTzs")}</Label>
          <Input
            id="principal"
            name="principal"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 500000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            aria-invalid={!!fieldErrors.principal}
          />
          {fieldErrors.principal && (
            <p className="text-sm text-destructive">{fieldErrors.principal}</p>
          )}
        </div>
        <div className="grid gap-2 min-w-0">
          <Label htmlFor="interestRate">{t("loans.interestRate")}</Label>
          <Input
            id="interestRate"
            name="interestRate"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            placeholder="e.g. 10"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            aria-invalid={!!fieldErrors.interestRate}
          />
          {fieldErrors.interestRate && (
            <p className="text-sm text-destructive">{fieldErrors.interestRate}</p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="durationMonths">{t("loans.durationMonths")}</Label>
        <Input
          id="durationMonths"
          name="durationMonths"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 6"
          value={durationMonths}
          onChange={(e) => setDurationMonths(e.target.value)}
          aria-invalid={!!fieldErrors.durationMonths}
        />
        {fieldErrors.durationMonths && (
          <p className="text-sm text-destructive">{fieldErrors.durationMonths}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reason">{t("loans.reasonOptional")}</Label>
        <Textarea
          id="reason"
          name="reason"
          rows={3}
          placeholder="e.g. Business capital"
          className="resize-none"
          aria-invalid={!!fieldErrors.reason}
        />
        {fieldErrors.reason && (
          <p className="text-sm text-destructive">{fieldErrors.reason}</p>
        )}
      </div>

      {hasValidInputs && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardDescription>{t("loans.repaymentFormula")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("loans.interest")}</span>
              <span className="font-medium">{formatTzs(interest)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1 border-t">
              <span>{t("loans.totalToRepay")}</span>
              <span>{formatTzs(totalRepayment)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <DialogFooter className="gap-3 sm:gap-3 pt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            {t("common.cancel")}
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.adding")}
            </>
          ) : (
            t("loans.addLoanButton")
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
