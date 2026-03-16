"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      await signOut({ callbackUrl: "/auth/login" });
      toast.success(t("notifications.loggedOut"));
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <LogOut className="size-4" />
      {t("sidebar.signOut")}
    </Button>
  );
}
