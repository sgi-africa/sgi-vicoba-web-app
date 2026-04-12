"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Users, Download, Loader2, Send } from "lucide-react";
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
import { useAppSelector } from "@/hooks/redux";
import { AddMemberForm } from "@/components/members/add-member-form";
import { addMember, getMembers } from "@/app/home/members/_action";
import { Member } from "@/interfaces/interface";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { ContentContainer } from "@/components/shared/content-container";
import { toE164Phone } from "@/lib/phone";

const MEMBER_ROLE_KEYS = ["chairperson", "treasurer", "secretary", "member"] as const;

function getRoleLabel(value: string, t: (key: string) => string) {
  const v = value?.toLowerCase();
  const key = MEMBER_ROLE_KEYS.find((r) => r === v);
  return key ? t(`members.${key}`) : value;
}

function getRoleBadgeClassName(role: string) {
  switch (role?.toLowerCase()) {
    case "chairperson":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/20";
    case "treasurer":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20";
    case "secretary":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/20";
    default:
      return "bg-muted text-muted-foreground ring-border/50";
  }
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
  const [sendingCredentialsFor, setSendingCredentialsFor] = useState<number | null>(null);
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

  async function handleSendCredentials(member: Member) {
    if (!groupId) return;
    const rawPhone = member.user.phone?.trim();
    if (!rawPhone) {
      toast.error(t("members.sendCredentialsNoPhone"));
      return;
    }

    const phoneE164 = toE164Phone(rawPhone);
    if (!phoneE164) {
      toast.error(t("members.sendCredentialsInvalidPhone"));
      return;
    }

    setSendingCredentialsFor(member.id);

    const formData = new FormData();
    formData.append("firstName", member.user.firstName);
    formData.append("lastName", member.user.lastName);
    formData.append("phone", phoneE164);
    formData.append("title", (member.title ?? "").toString().toUpperCase());

    try {
      await addMember(groupId, formData);
      toast.success(t("notifications.credentialsSent"));
    } catch (err: unknown) {
      let message = t("notifications.credentialsSendFailed");
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { status?: number; data?: { message?: string } } }).response;
        if (res?.status === 409) {
          message = t("notifications.memberAlreadyExists");
        } else {
          message = res?.data?.message ?? message;
        }
      } else if (err instanceof Error) {
        // Server Actions often serialize Axios errors into plain Error messages (losing response.status)
        if (/status code 409\b/.test(err.message)) {
          message = t("notifications.memberAlreadyExists");
        } else {
          message = err.message || message;
        }
      }
      toast.error(message);
    } finally {
      setSendingCredentialsFor(null);
    }
  }

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
      <ContentContainer className="pt-5">
        <EmptyState
          icon={Users}
          title={t("common.noGroupSelected")}
          description={t("common.selectGroupFromDashboard")}
        />
      </ContentContainer>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      <PageHeader
        title={t("members.title")}
        description={t("members.countInGroup", {
          count: totalMembers,
          label: totalMembers === 1 ? t("common.member") : t("common.members"),
        })}
      >
        {members.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-border/60"
            onClick={handleDownloadMembers}
            title={t("members.downloadMembers")}
          >
            <Download className="size-4" />
          </Button>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
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
      </PageHeader>

      <ContentContainer>
        {members.length > 0 && !isLoading && (
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("members.searchPlaceholder")}
              ariaLabel={t("members.searchAria")}
            />
          </div>
        )}

        {isLoading ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="size-6 text-muted-foreground animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">{t("members.loadingMembers")}</p>
            </CardContent>
          </Card>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t("members.noMembersYet")}
            description={t("members.getStartedAddMember")}
          />
        ) : filteredMembers.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                {searchQuery.trim() ? t("members.noMatchSearch") : t("members.noMembersYet")}
              </p>
              {searchQuery.trim() && (
                <Button variant="link" className="mt-2" onClick={() => setSearchQuery("")}>
                  {t("common.clearSearch")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="shadow-sm border-border/60 transition-all hover:shadow-md hover:border-border"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {member.user.firstName[0]}
                      {member.user.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.phone || t("common.noPhone")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full border-border/60 bg-background shadow-sm hover:bg-muted/60 hover:border-border focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.99] transition"
                      disabled={sendingCredentialsFor === member.id}
                      onClick={() => handleSendCredentials(member)}
                    >
                      {sendingCredentialsFor === member.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      {sendingCredentialsFor === member.id
                        ? t("members.sendingCredentials")
                        : t("members.sendCredentials")}
                    </Button>
                    <span
                      className={[
                        "text-xs font-semibold px-3 py-1 rounded-full ring-1",
                        getRoleBadgeClassName(member.title),
                      ].join(" ")}
                    >
                      {getRoleLabel(member.title, t)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ContentContainer>
    </div>
  );
}
