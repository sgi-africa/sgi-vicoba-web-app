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
import { useRouter } from "next/navigation";


export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {

    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            await registerUser(formData)
            router.push("/auth/login")
            toast.success("Registered successfully! Login to continue")
        } catch (error: any) {
            toast.error(error.message || "Registration failed")
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Welcome</CardTitle>
                    <CardDescription>
                        Welcome to SGI Africa - Get started, stay secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    name="fullName"
                                    type="text"
                                    placeholder="john doe"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="johndoe@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input name="password" type="password" required />
                            </div>
                            <div className="flex flex-col gap-3">
                                {loading ? (
                                    <Button type="submit" className="w-full cursor-not-allowed disabled">
                                        Signing Up...
                                    </Button>
                                ) : (
                                    <Button type="submit" className="w-full cursor-pointer">
                                        Sign Up
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="underline underline-offset-4">
                                Sign In Here.
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}