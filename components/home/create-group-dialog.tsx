"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
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
  labelKey: value === "EQUALANNUAL" ? "equalAnnual" : "rotational",
}))

type GroupType = (typeof GROUP_TYPES)[number]

interface CreateGroupDialogProps {
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
  onSuccess?: (createdGroup: GroupResponse) => void
}

export function CreateGroupDialog({ variant = "default", className, onSuccess }: CreateGroupDialogProps) {
  const router = useRouter()
  const { t } = useTranslation()
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
      toast.success(t("notifications.groupCreated"))
      setOpen(false)
      setType("")
      form.reset()
      if (onSuccess) {
        onSuccess(createdGroup)
      }
      router.refresh()
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
          {t("groups.createGroup")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("groups.createNewGroup")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">{t("groups.groupName")}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t("groups.groupNamePlaceholder")}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">{t("groups.country")}</Label>
            <Input
              id="country"
              name="country"
              placeholder={t("groups.countryPlaceholder")}
              aria-invalid={!!fieldErrors.country}
            />
            {fieldErrors.country && (
              <p className="text-sm text-destructive">{fieldErrors.country}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">{t("groups.city")}</Label>
            <Input
              id="city"
              name="city"
              placeholder={t("groups.cityPlaceholder")}
              aria-invalid={!!fieldErrors.city}
            />
            {fieldErrors.city && (
              <p className="text-sm text-destructive">{fieldErrors.city}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="region">{t("groups.region")}</Label>
            <Input
              id="region"
              name="region"
              placeholder={t("groups.regionPlaceholder")}
              aria-invalid={!!fieldErrors.region}
            />
            {fieldErrors.region && (
              <p className="text-sm text-destructive">{fieldErrors.region}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="street">{t("groups.streetAddress")}</Label>
            <Input
              id="street"
              name="street"
              placeholder={t("groups.streetPlaceholder")}
              aria-invalid={!!fieldErrors.street}
            />
            {fieldErrors.street && (
              <p className="text-sm text-destructive">{fieldErrors.street}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t("groups.descriptionOptional")}</Label>
            <Input
              id="description"
              name="description"
              placeholder={t("groups.descriptionPlaceholder")}
              aria-invalid={!!fieldErrors.description}
            />
            {fieldErrors.description && (
              <p className="text-sm text-destructive">{fieldErrors.description}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">{t("groups.type")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as GroupType)}>
              <SelectTrigger id="type" aria-invalid={!!fieldErrors.type}>
                <SelectValue placeholder={t("groups.selectType")} />
              </SelectTrigger>
              <SelectContent>
                {GROUP_TYPE_OPTIONS.map(({ value, labelKey }) => (
                  <SelectItem key={value} value={value}>
                    {t(`groups.${labelKey}`)}
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
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              {isPending ? t("groups.creating") : t("groups.createGroupButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
