"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { AddMemberForm } from "@/components/members/add-member-form";
import { getMembers } from "@/app/home/members/_action";
import { Member } from "@/interfaces/interface";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MEMBER_ROLES = [
  { value: "chairperson", label: "Chairperson" },
  { value: "treasurer", label: "Treasurer" },
  { value: "secretary", label: "Secretary" },
  { value: "member", label: "Member" },
] as const;

function getRoleLabel(value: string) {
  const v = value?.toLowerCase();
  return MEMBER_ROLES.find((r) => r.value === v)?.label ?? value;
}

export default function MembersPageClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
    toast.success("Member added successfully");
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
    doc.text("Member Registry", 14, 20);
    doc.setFontSize(12);
    doc.text(groupName, 14, 28);
    doc.text(date, 14, 34);

    autoTable(doc, {
      startY: 42,
      head: [["Name", "Phone", "Role"]],
      body: members.map((m) => [
        `${m.user.firstName} ${m.user.lastName}`,
        m.user.phone || "—",
        getRoleLabel(m.title),
      ]),
      theme: "striped",
    });

    doc.save(`${groupName.replace(/\s+/g, "-")}-members-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const totalMembers = members.length;

  if (!activeGroup) {
    return (
      <div className="flex flex-col flex-1 overflow-auto w-full px-4 py-4 md:px-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No group selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Select a group from the dashboard to view and manage its members.
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
          <h2 className="text-2xl font-bold tracking-tight">Member Registry</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalMembers} {totalMembers === 1 ? "member" : "members"} in this group
          </p>
        </div>

        <div className="flex items-center gap-2">
          {members.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer shrink-0"
              onClick={handleDownloadMembers}
              title="Download members"
            >
              <Download className="size-4" />
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 cursor-pointer">
                <Plus className="size-4" />
                Add member
              </Button>
            </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add new member</DialogTitle>
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
        {isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-sm text-muted-foreground">Loading members…</p>
            </CardContent>
          </Card>
        ) : members.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Users className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No members yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Get started by adding your first member. Click &quot;Add member&quot;.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
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
                        {member.user.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                    {getRoleLabel(member.title)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}