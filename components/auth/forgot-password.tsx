'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema } from "@/lib/zod"
import type { output } from "zod"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import forgotPassword from "@/app/auth/forgot-password/_action"

type ForgotPasswordFormValues = output<typeof forgotPasswordSchema>

export function ForgotPassword({ className, ...props }: React.ComponentProps<"div">) {

    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: ""
        }
    })

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setLoading(true)

        try {
            await forgotPassword(data.email)

            setSubmittedEmail(data.email)
            setEmailSent(true)

            toast.success(t("notifications.resetLinkSent"))
        } catch (error) {
            console.error(error)
            toast.error(t("notifications.resetLinkFailed"))
        } finally {
            setLoading(false)
        }
    }

    // Card to display when email is sent
    if (emailSent) {
        return (
            <div className="flex w-full max-w-md flex-col gap-6">
                <Card className="shadow-lg border-muted">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-2xl font-semibold"> 
                            Check your email
                        </CardTitle>

                        <CardDescription>
                            If <strong>{submittedEmail}</strong> matches an account, we&apos;ve sent
                            a password reset link.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 text-sm text-muted-foreground text-center">

                        <p>
                            If you haven&apos;t received the email in 5 minutes, check your spam
                            folder.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => window.open("https://mail.google.com", "_blank")}
                            >
                                Open Gmail
                            </Button>

                            <div className="flex flex-row gap-1 items-center justify-center">
                                <h1> Return to</h1>
                                <Link
                                    href="/auth/login"
                                    className="text-sm underline underline-offset-4"
                                >
                                    login
                                </Link>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "flex w-full max-w-md flex-col gap-6",
                className
            )}
            {...props}
        >
            <Card className="shadow-lg border-muted">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-semibold">
                        {t("auth.resetPasswordTitle")}
                    </CardTitle>

                    <CardDescription className="text-sm">
                        {t("auth.resetPasswordDescription")}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                {t("auth.emailAddress")}
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="johndoe@gmail.com"
                                disabled={loading}
                                {...register("email")}
                                aria-invalid={!!errors.email}
                            />

                            {errors.email && (
                                <p className="text-sm text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("auth.sendingResetLink")}
                                </>
                            ) : (
                                t("auth.sendResetLink")
                            )}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            {t("auth.rememberPassword")}{" "}
                            <Link
                                href="/auth/login"
                                className="font-medium underline underline-offset-4 hover:text-primary"
                            >
                                {t("auth.backToLogin")}
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}