"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateGroup } from "@/app/home/settings/_action"
import { updateGroupSchema, GROUP_TYPES } from "@/lib/zod"
import { EditGroupFormProps } from "@/interfaces/interface"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const GROUP_TYPE_OPTIONS = GROUP_TYPES.map((value) => ({
  value,
  labelKey: value === "EQUALANNUAL" ? "equalAnnual" : "rotational",
}))

type GroupType = (typeof GROUP_TYPES)[number]

export function EditGroupForm({ group, onSuccess, className }: EditGroupFormProps) {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isPending, setIsPending] = useState(false)
  const [type, setType] = useState<GroupType>(
    (group.type?.toUpperCase() === "ROTATIONAL" ? "ROTATIONAL" : "EQUALANNUAL") as GroupType
  )

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
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim() || undefined,
      type,
    }

    const result = updateGroupSchema.safeParse(rawFormData)

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
      const updated = await updateGroup(group.id, result.data)
      if (updated) onSuccess?.(updated)
    } catch (err: unknown) {
      let message = "Failed to update group"
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
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg" role="alert">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">{t("groups.groupName")}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={group.name}
          placeholder={t("groups.groupNamePlaceholder")}
          aria-invalid={!!fieldErrors.name}
          className="h-10"
        />
        {fieldErrors.name && (
          <p className="text-sm text-destructive">{fieldErrors.name}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">{t("groups.country")}</Label>
          <Input
            id="country"
            name="country"
            defaultValue={group.country}
            placeholder={t("groups.countryPlaceholder")}
            aria-invalid={!!fieldErrors.country}
            className="h-10"
          />
          {fieldErrors.country && (
            <p className="text-sm text-destructive">{fieldErrors.country}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("groups.city")}</Label>
          <Input
            id="city"
            name="city"
            defaultValue={group.city}
            placeholder={t("groups.cityPlaceholder")}
            aria-invalid={!!fieldErrors.city}
            className="h-10"
          />
          {fieldErrors.city && (
            <p className="text-sm text-destructive">{fieldErrors.city}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="region">{t("groups.region")}</Label>
          <Input
            id="region"
            name="region"
            defaultValue={group.region}
            placeholder={t("groups.regionPlaceholder")}
            aria-invalid={!!fieldErrors.region}
            className="h-10"
          />
          {fieldErrors.region && (
            <p className="text-sm text-destructive">{fieldErrors.region}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">{t("groups.streetAddress")}</Label>
          <Input
            id="street"
            name="street"
            defaultValue={group.streetAddress}
            placeholder={t("groups.streetPlaceholder")}
            aria-invalid={!!fieldErrors.street}
            className="h-10"
          />
          {fieldErrors.street && (
            <p className="text-sm text-destructive">{fieldErrors.street}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{t("groups.descriptionOptional")}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={group.description ?? ""}
          placeholder={t("groups.descriptionPlaceholder")}
          rows={3}
          aria-invalid={!!fieldErrors.description}
        />
        {fieldErrors.description && (
          <p className="text-sm text-destructive">{fieldErrors.description}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">{t("groups.type")}</Label>
        <Select value={type} onValueChange={(v) => setType(v as GroupType)}>
          <SelectTrigger id="type" aria-invalid={!!fieldErrors.type} className="h-10">
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
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("settings.saving")}
          </>
        ) : (
          t("settings.saveChanges")
        )}
      </Button>
    </form>
  )
}
