"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function LogoutButton() {

    const { t } = useTranslation();

    const handleSignOut = async () => {
        try {
            localStorage.clear();
            await signOut({ callbackUrl: "/auth/login" });
            toast.success(t("notifications.loggedOut"))
        } catch (error) {
            console.error("Sign-out failed:", error);
        }
    }

    return (
        <Button variant="destructive" onClick={handleSignOut} className="w-full cursor-pointer">{t("sidebar.signOut")}</Button >
    );
}