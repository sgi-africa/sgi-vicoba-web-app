"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Button } from "@/components/ui/button"
import { sellShares } from "@/app/home/shares/_action"
import { sellSharesSchema } from "@/lib/zod"
import { MemberOption } from "@/interfaces/interface"


interface SellSharesModalProps {
  groupId: number
  members: MemberOption[]
  onSuccess?: () => void
  trigger: React.ReactNode
}

export function SellSharesModal({
  groupId,
  members,
  onSuccess,
  trigger,
}: SellSharesModalProps) {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const quantityInput = (form.elements.namedItem("quantity") as HTMLInputElement).value.trim()

    const rawFormData = {
      userId,
      quantity: quantityInput,
    }

    const result = sellSharesSchema.safeParse(rawFormData)

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
      await sellShares(groupId, {
        userId: result.data.userId,
        quantity: result.data.quantity,
      })
      setOpen(false)
      setUserId("")
      form.reset()
      onSuccess?.()
    } catch (err: unknown) {
      let message = "Failed to sell shares"
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

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setError(null)
      setFieldErrors({})
      setUserId("")
    }
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell shares</DialogTitle>
        </DialogHeader>
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
                  <SelectItem key={member.userId} value={String(member.userId)}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.userId && (
              <p className="text-sm text-destructive">{fieldErrors.userId}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 10"
              aria-invalid={!!fieldErrors.quantity}
            />
            {fieldErrors.quantity && (
              <p className="text-sm text-destructive">{fieldErrors.quantity}</p>
            )}
          </div>
          <DialogFooter className="gap-4 sm:gap-4 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Selling…" : "Sell shares"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
