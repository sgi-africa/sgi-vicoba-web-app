"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addContribution } from "@/app/home/contributions/_action"
import { addContributionSchema, CONTRIBUTION_TYPES } from "@/lib/zod"
import { Member, Penalty } from "@/interfaces/interface"
import { Loader2 } from "lucide-react"

const CONTRIBUTION_TYPE_OPTIONS = [
  { value: "SAVINGS" as const, labelKey: "savings" },
  { value: "JAMII" as const, labelKey: "jamii" },
  { value: "PENALTY" as const, labelKey: "penalty" },
]

type ContributionType = (typeof CONTRIBUTION_TYPES)[number]

export interface AddContributionFormProps {
  groupId: number
  members: Member[]
  penalties?: Penalty[]
  onSuccess?: () => void
  onClose: () => void
}

const PENDING_STATUSES = ["PENDING", "UNPAID"]

/** Nest-style message when paying a penalty with the wrong amount. */
const PENALTY_AMOUNT_MISMATCH_EN =
  /^Contribution amount \((\d+(?:\.\d+)?)\) must match penalty amount \((\d+(?:\.\d+)?)\)\.?$/i

type LocalizedContributionError = {
  message: string
  fieldErrors: Record<string, string>
}

function localizeContributionApiError(
  rawMessage: string,
  t: TFunction
): LocalizedContributionError {
  const trimmed = rawMessage.trim()
  const match = trimmed.match(PENALTY_AMOUNT_MISMATCH_EN)
  if (match) {
    const [, contribution, penalty] = match
    const msg = t("contributions.penaltyAmountMismatch", {
      contribution,
      penalty,
    })
    return { message: msg, fieldErrors: { amount: msg } }
  }
  return { message: trimmed, fieldErrors: {} }
}

export function AddContributionForm({
  groupId,
  members,
  penalties = [],
  onSuccess,
  onClose,
}: AddContributionFormProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [type, setType] = useState<ContributionType | "">("")
  const [penaltyId, setPenaltyId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")

  const pendingPenalties = useMemo(
    () =>
      type === "PENALTY" && userId
        ? penalties.filter(
          (p) => p.userId === Number(userId) && PENDING_STATUSES.includes(p.status?.toUpperCase?.() ?? "")
        )
        : [],
    [type, userId, penalties]
  )

  useEffect(() => {
    if (penaltyId && !pendingPenalties.some((p) => p.id === Number(penaltyId))) {
      setPenaltyId("")
      setAmount("")
    }
  }, [userId, type, pendingPenalties, penaltyId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const amountInput = amount || (form.elements.namedItem("amount") as HTMLInputElement)?.value?.trim() || ""

    if (type === "PENALTY" && pendingPenalties.length > 0 && !penaltyId) {
      setFieldErrors({ penaltyId: t("contributions.pleaseSelectPenalty") })
      setIsPending(false)
      return
    }

    const rawFormData = {
      userId,
      amount: amountInput,
      type,
      penaltyId: type === "PENALTY" && penaltyId ? penaltyId : undefined,
    }

    const result = addContributionSchema.safeParse(rawFormData)

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
      const submitResult = await addContribution(groupId, {
        userId: result.data.userId,
        amount: result.data.amount,
        type: result.data.type,
        penaltyId: result.data.penaltyId,
      })

      if (submitResult.ok) {
        setUserId("")
        setType("")
        setPenaltyId("")
        setAmount("")
        onSuccess?.()
        onClose()
      } else {
        const raw =
          submitResult.message.trim() || t("contributions.addContributionFailed")
        const { message, fieldErrors: apiFieldErrors } =
          localizeContributionApiError(raw, t)
        setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }))
        setError(message)
      }
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
        <Label htmlFor="userId">{t("contributions.member")}</Label>
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
      <div className="grid gap-2">
        <Label htmlFor="type">{t("common.type")}</Label>
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v as ContributionType)
            if (v !== "PENALTY") {
              setPenaltyId("")
              setAmount("")
            }
          }}
        >
          <SelectTrigger id="type" aria-invalid={!!fieldErrors.type}>
            <SelectValue placeholder={t("common.selectType")} />
          </SelectTrigger>
          <SelectContent>
            {CONTRIBUTION_TYPE_OPTIONS.map(({ value, labelKey }) => (
              <SelectItem key={value} value={value}>
                {t(`common.${labelKey}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.type && (
          <p className="text-sm text-destructive">{fieldErrors.type}</p>
        )}
      </div>
      {type === "PENALTY" && pendingPenalties.length > 0 && (
        <div className="grid gap-2">
          <Label htmlFor="penaltyId">{t("contributions.penaltyToPay")}</Label>
          <Select
            value={penaltyId}
            onValueChange={(id) => {
              setPenaltyId(id)
              const penalty = pendingPenalties.find((p) => p.id === Number(id))
              if (penalty) setAmount(String(penalty.amount))
            }}
          >
            <SelectTrigger id="penaltyId" aria-invalid={!!fieldErrors.penaltyId}>
              <SelectValue placeholder={t("contributions.selectPenaltyToPay")} />
            </SelectTrigger>
            <SelectContent>
              {pendingPenalties.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.type} – {p.amount} {p.reason ? `(${p.reason})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.penaltyId && (
            <p className="text-sm text-destructive">{fieldErrors.penaltyId}</p>
          )}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="amount">{t("contributions.amountTzs")}</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-invalid={!!fieldErrors.amount}
        />
        {fieldErrors.amount && (
          <p className="text-sm text-destructive">{fieldErrors.amount}</p>
        )}
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.adding")}
            </>
          ) : (
            t("contributions.addContributionButton")
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
