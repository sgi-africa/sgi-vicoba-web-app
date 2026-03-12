"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import createGroup from "@/app/home/groups/_action"
import { createGroupSchema, GROUP_TYPES } from "@/lib/zod"
import { toast } from "sonner"
import { GroupResponse } from "@/interfaces/interface"
import { cn } from "@/lib/utils"

const GROUP_TYPE_OPTIONS = GROUP_TYPES.map((value) => ({
  value,
  label: value === "EQUALANNUAL" ? "Equal Annual" : "Rotational",
}))

type GroupType = (typeof GROUP_TYPES)[number]

interface CreateGroupDialogProps {
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
  onSuccess?: (createdGroup: GroupResponse) => void
}

export function CreateGroupDialog({ variant = "default", className, onSuccess }: CreateGroupDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<GroupType | "">("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsPending(true)

    const form = e.currentTarget
    const rawFormData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      country: (form.elements.namedItem("country") as HTMLInputElement).value.trim(),
      city: (form.elements.namedItem("city") as HTMLInputElement).value.trim(),
      region: (form.elements.namedItem("region") as HTMLInputElement).value.trim(),
      street: (form.elements.namedItem("street") as HTMLInputElement).value.trim(),
      description: (form.elements.namedItem("description") as HTMLInputElement).value.trim() || undefined,
      type,
    }

    const result = createGroupSchema.safeParse(rawFormData)

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
      const createdGroup = await createGroup(result.data)
      toast.success("Group created successfully")
      setOpen(false)
      setType("")
      form.reset()
      if (onSuccess) {
        onSuccess(createdGroup)
      } else {
        router.refresh()
      }
    } catch (err: unknown) {
      let message = "Failed to create group"
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
      setType("")
      setError(null)
      setFieldErrors({})
    }
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant ?? "default"} size="sm" className={cn("cursor-pointer", className)}>
          <Plus className="size-4" />
          Create group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Group name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. My Savings Group"
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              placeholder="e.g. Tanzania"
              aria-invalid={!!fieldErrors.country}
            />
            {fieldErrors.country && (
              <p className="text-sm text-destructive">{fieldErrors.country}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              placeholder="e.g. Dar es Salaam"
              aria-invalid={!!fieldErrors.city}
            />
            {fieldErrors.city && (
              <p className="text-sm text-destructive">{fieldErrors.city}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              name="region"
              placeholder="e.g. Dar es Salaam"
              aria-invalid={!!fieldErrors.region}
            />
            {fieldErrors.region && (
              <p className="text-sm text-destructive">{fieldErrors.region}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="street">Street address</Label>
            <Input
              id="street"
              name="street"
              placeholder="e.g. 123 Main Street"
              aria-invalid={!!fieldErrors.street}
            />
            {fieldErrors.street && (
              <p className="text-sm text-destructive">{fieldErrors.street}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="Brief description of the group"
              aria-invalid={!!fieldErrors.description}
            />
            {fieldErrors.description && (
              <p className="text-sm text-destructive">{fieldErrors.description}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as GroupType)}>
              <SelectTrigger id="type" aria-invalid={!!fieldErrors.type}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {GROUP_TYPE_OPTIONS.map(({ value, label }) => (
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
              {isPending ? "Creating…" : "Create group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
