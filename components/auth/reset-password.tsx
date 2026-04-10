'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema } from "@/lib/zod"
import type { output } from "zod"
import { Loader2, LockKeyhole } from "lucide-react"
import resetPassword from "@/app/auth/reset-password/_action"
import { useSearchParams } from "next/navigation"

type ResetPasswordFormValues = output<typeof resetPasswordSchema>

export function ResetPassword({
  className,
  token,
  ...props
}: React.ComponentProps<"div"> & { token?: string }) {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  const resolvedToken = useMemo(() => {
    const fromProp = token?.trim()
    if (fromProp) return fromProp
    return (searchParams?.get("token") || "").trim()
  }, [token, searchParams])

  const hasToken = resolvedToken.length > 0

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!hasToken) {
      toast.error("Reset link is missing or invalid. Please request a new one.")
      return
    }

    setLoading(true)
    try {
      await resetPassword({ token: resolvedToken, password: data.password })
      toast.success("Password reset successful. Please log in.")
      window.location.href = "/auth/login"
    } catch (error) {
      console.error(error)
      toast.error("Failed to reset password. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-6", className)} {...props}>
      <Card className="shadow-sm border-border/60">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LockKeyhole className="size-6" />
            </div>
          </div>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasToken && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              This reset link is missing a token. Please request a new reset link.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                disabled={loading || !hasToken}
                {...register("password")}
                aria-invalid={!!errors.password}
                className="h-10"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                disabled={loading || !hasToken}
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
                className="h-10"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading || !hasToken} className="w-full h-10">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Back to{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

