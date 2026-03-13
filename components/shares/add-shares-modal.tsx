"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { addShares } from "@/app/home/shares/_action"
import { addSharesSchema } from "@/lib/zod"
import { cn } from "@/lib/utils"

interface AddSharesModalProps {
  groupId: number
  onSuccess?: () => void
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
}

export function AddSharesModal({
  groupId,
  onSuccess,
  variant = "default",
  className,
}: AddSharesModalProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const totalSharesInput = (form.elements.namedItem("totalShares") as HTMLInputElement).value.trim()
    const sharePriceInput = (form.elements.namedItem("sharePrice") as HTMLInputElement).value.trim()

    const rawFormData = {
      totalShares: totalSharesInput,
      sharePrice: sharePriceInput,
    }

    const result = addSharesSchema.safeParse(rawFormData)

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
      await addShares(groupId, {
        totalShares: result.data.totalShares,
        sharePrice: result.data.sharePrice,
      })
      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (err: unknown) {
      let message = "Failed to add shares"
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
    }
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className={cn(className, "cursor-pointer")}>
          <Plus className="size-4" />
          Add shares
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add shares</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="totalShares">Total shares</Label>
            <Input
              id="totalShares"
              name="totalShares"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 100"
              aria-invalid={!!fieldErrors.totalShares}
            />
            {fieldErrors.totalShares && (
              <p className="text-sm text-destructive">{fieldErrors.totalShares}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sharePrice">Share price (TZS)</Label>
            <Input
              id="sharePrice"
              name="sharePrice"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 300"
              aria-invalid={!!fieldErrors.sharePrice}
            />
            {fieldErrors.sharePrice && (
              <p className="text-sm text-destructive">{fieldErrors.sharePrice}</p>
            )}
          </div>
          <DialogFooter className="gap-4 sm:gap-4 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending} className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              {isPending ? "Adding…" : "Add shares"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
