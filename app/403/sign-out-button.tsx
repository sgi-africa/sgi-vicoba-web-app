"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SignOutButton() {
  const { t } = useTranslation();

  const handleSignOut = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="gap-2 border-border hover:bg-muted hover:text-foreground"
    >
      <LogOut className="size-4" />
      {t("forbidden.signOut")}
    </Button>
  );
}
