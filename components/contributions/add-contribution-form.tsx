"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { addContribution } from "@/app/home/contributions/_action"
import { addContributionSchema, CONTRIBUTION_TYPES } from "@/lib/zod"
import { Member } from "@/interfaces/interface"

const CONTRIBUTION_TYPE_OPTIONS = [
  { value: "SAVINGS" as const, label: "Savings" },
  { value: "JAMII" as const, label: "Jamii" },
  { value: "PENALTY" as const, label: "Penalty" },
]

type ContributionType = (typeof CONTRIBUTION_TYPES)[number]

interface AddContributionFormProps {
  groupId: number
  members: Member[]
  onSuccess?: () => void
  onClose: () => void
}

export function AddContributionForm({
  groupId,
  members,
  onSuccess,
  onClose,
}: AddContributionFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [type, setType] = useState<ContributionType | "">("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const amountInput = (form.elements.namedItem("amount") as HTMLInputElement).value.trim()

    const rawFormData = {
      userId,
      amount: amountInput,
      type,
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
      await addContribution(groupId, {
        userId: result.data.userId,
        amount: result.data.amount,
        type: result.data.type,
      })
      setUserId("")
      setType("")
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      let message = "Failed to add contribution"
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
        <Label htmlFor="userId">Member</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger id="userId" aria-invalid={!!fieldErrors.userId}>
            <SelectValue placeholder="Select member" />
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
        <Label htmlFor="amount">Amount (TZS)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 50000"
          aria-invalid={!!fieldErrors.amount}
        />
        {fieldErrors.amount && (
          <p className="text-sm text-destructive">{fieldErrors.amount}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="type">Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as ContributionType)}>
          <SelectTrigger id="type" aria-invalid={!!fieldErrors.type}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {CONTRIBUTION_TYPE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.type && (
          <p className="text-sm text-destructive">{fieldErrors.type}</p>
        )}
      </div>
      <DialogFooter className="gap-4 sm:gap-4 pt-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending} className="cursor-pointer">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending ? "Adding…" : "Add contribution"}
        </Button>
      </DialogFooter>
    </form>
  )
}
