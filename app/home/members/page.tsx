"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Users, Download, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { AddMemberForm } from "@/components/members/add-member-form";
import { getMembers } from "@/app/home/members/_action";
import { Member } from "@/interfaces/interface";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MEMBER_ROLE_KEYS = ["chairperson", "treasurer", "secretary", "member"] as const;

function getRoleLabel(value: string, t: (key: string) => string) {
  const v = value?.toLowerCase();
  const key = MEMBER_ROLE_KEYS.find((r) => r === v);
  return key ? t(`members.${key}`) : value;
}

function matchesSearch(member: Member, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
  const phone = (member.user.phone ?? "").toLowerCase();
  return fullName.includes(q) || phone.includes(q);
}

export default function MembersPageClient() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeGroup = useAppSelector((state) => state.group.activeGroup);
  const groupId = activeGroup?.id;

  async function fetchMembers(id: number) {
    setIsLoading(true);
    const data = await getMembers(id);
    setMembers(data ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!groupId) return;
    fetchMembers(groupId);
  }, [groupId]);

  const handleAddSuccess = async () => {
    if (!groupId) return;
    await fetchMembers(groupId);
    setOpen(false);
    toast.success(t("notifications.memberAdded"));
  };

  function handleDownloadMembers() {
    if (!activeGroup || members.length === 0) return;

    const doc = new jsPDF();
    const groupName = activeGroup.name;
    const date = new Date().toLocaleDateString("en-TZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.setFontSize(18);
    doc.text(t("members.title"), 14, 20);
    doc.setFontSize(12);
    doc.text(groupName, 14, 28);
    doc.text(date, 14, 34);

    autoTable(doc, {
      startY: 42,
      head: [[t("common.name"), t("common.phone"), t("common.role")]],
      body: members.map((m) => [
        `${m.user.firstName} ${m.user.lastName}`,
        m.user.phone || "—",
        getRoleLabel(m.title, t),
      ]),
      theme: "striped",
    });

    doc.save(`${groupName.replace(/\s+/g, "-")}-members-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const filteredMembers = useMemo(
    () => members.filter((m) => matchesSearch(m, searchQuery)),
    [members, searchQuery]
  );
  const totalMembers = members.length;

  if (!activeGroup) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t("common.noGroupSelected")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {t("common.selectGroupFromDashboard")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("members.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("members.countInGroup", { count: totalMembers, label: totalMembers === 1 ? t("common.member") : t("common.members") })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {members.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer shrink-0"
              onClick={handleDownloadMembers}
              title={t("members.downloadMembers")}
            >
              <Download className="size-4" />
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 cursor-pointer">
                <Plus className="size-4" />
                {t("members.addMember")}
              </Button>
            </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("members.addNewMember")}</DialogTitle>
          </DialogHeader>

          {groupId && (
            <AddMemberForm
              groupId={groupId!}
              onSuccess={handleAddSuccess}
              onClose={() => setOpen(false)}
            />
          )}
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 pb-6">
        {members.length > 0 && !isLoading && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={t("members.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50"
              aria-label={t("members.searchAria")}
            />
          </div>
        )}
        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-sm text-muted-foreground">{t("members.loadingMembers")}</p>
            </CardContent>
          </Card>
        ) : members.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Users className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t("members.noMembersYet")}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {t("members.getStartedAddMember")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery.trim()
                      ? t("members.noMatchSearch")
                      : t("members.noMembersYet")}
                  </p>
                  {searchQuery.trim() && (
                    <Button
                      variant="link"
                      className="mt-2 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    >
                      {t("common.clearSearch")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredMembers.map((member) => (
                <Card
                  key={member.id}
                  className={cn("transition-colors hover:bg-accent/30", "cursor-default")}
                >
                  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {member.user.firstName[0]}
                        {member.user.lastName[0]}
                      </div>

                      <div>
                        <p className="font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {member.user.phone || t("common.noPhone")}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                      {getRoleLabel(member.title, t)}
                    </span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}