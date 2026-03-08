/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import registerUser from "@/app/auth/register/_action"
import { useState } from "react"
import { toast } from 'sonner'
import { useRouter } from "next/navigation"
import "react-phone-number-input/style.css"
import PhoneInput from "react-phone-number-input"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "@/lib/zod"
import type { output } from "zod"
import { useTranslation } from "react-i18next"

type RegisterFormValues = output<typeof registerSchema>

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {

    const { t } = useTranslation()
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: undefined,
            password: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true);
        const formData = new FormData();
        formData.set("firstName", data.firstName);
        formData.set("lastName", data.lastName);
        formData.set("email", data.email);
        formData.set("password", data.password);
        if (data.phone) formData.set("phone", data.phone);

        try {
            await registerUser(formData);
            router.push("/auth/login");
            toast.success(t("notifications.registeredSuccess"));
        } catch (error: any) {
            toast.error(error.message || t("notifications.registrationFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl">{t("auth.registerWelcome")}</CardTitle>
                    <CardDescription>
                        {t("auth.registerDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-3">
                                    <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        {...register("firstName")}
                                        aria-invalid={!!errors.firstName}
                                    />
                                    {errors.firstName && (
                                        <p className="text-sm text-destructive">{errors.firstName.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        {...register("lastName")}
                                        aria-invalid={!!errors.lastName}
                                    />
                                    {errors.lastName && (
                                        <p className="text-sm text-destructive">{errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="email">{t("auth.email")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="johndoe@gmail.com"
                                    {...register("email")}
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="phone">{t("auth.phoneNumber")}</Label>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <PhoneInput
                                            international
                                            defaultCountry="TZ"
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            placeholder="e.g. 712 345 678"
                                            id="phone"
                                            ref={field.ref}
                                            className="phone-input-wrapper"
                                        />
                                    )}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">{t("auth.password")}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    aria-invalid={!!errors.password}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                {loading ? (
                                    <Button type="submit" className="w-full cursor-not-allowed" disabled>
                                        {t("auth.signingUp")}
                                    </Button>
                                ) : (
                                    <Button type="submit" className="w-full cursor-pointer">
                                        {t("auth.signUpButton")}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            {t("auth.alreadyAccount")}{" "}
                            <Link href="/auth/login" className="underline underline-offset-4">
                                {t("auth.signUpHere")}
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}