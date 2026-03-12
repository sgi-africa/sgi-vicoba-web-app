'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { toast } from 'sonner'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema } from "@/lib/zod"
import type { output } from "zod"
import { useTranslation } from "react-i18next"

type SignInFormValues = output<typeof signInSchema>

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {

    const { t } = useTranslation()
    const [loading, setLoading] = useState(false);
    const callbackUrl = "/home";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: SignInFormValues) => {
        setLoading(true);

        try {
            const results = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
                callbackUrl,
            });
            if (results?.error) {
                console.error("Login failed:", results.error);
                toast.error(t("notifications.wrongCredentials"))
            } else {
                window.location.href = callbackUrl;
                toast.success(t("notifications.welcomeBack"))
            }
        } catch (error) {
            console.error("Sign-in error:", error);
            toast.error(t("notifications.loginFailed"))
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">{t("auth.loginTitle")}</CardTitle>
                    <CardDescription>
                        {t("auth.loginDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">{t("auth.email")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="johndoe@gmail.com"
                                    disabled={loading}
                                    {...register("email")}
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">{t("auth.password")}</Label>
                                    <Link href="/auth/forgot-password" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">{t("auth.forgotPassword")}</Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    disabled={loading}
                                    {...register("password")}
                                    aria-invalid={!!errors.password}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                {loading ? (
                                    <Button className="w-full cursor-not-allowed" disabled>
                                        {t("auth.signingIn")}
                                    </Button>
                                ) : (
                                    <Button type="submit" className="w-full cursor-pointer">
                                        {t("auth.signIn")}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            {t("auth.noAccount")}{" "}
                            <Link href="/auth/register" className="underline underline-offset-4">
                                {t("auth.signUp")}
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}