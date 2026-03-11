"use client"

import { useState } from "react"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Dummy data - replace with backend fetch later
const MEMBER_ROLES = [
  { value: "CHAIRPERSON", label: "Chairperson" },
  { value: "TREASURER", label: "Treasurer" },
  { value: "SECRETARY", label: "Secretary" },
  { value: "MEMBER", label: "Member" },
] as const

type MemberRole = (typeof MEMBER_ROLES)[number]["value"]

interface Member {
  id: string
  firstName: string
  lastName: string
  phone: string
  title: MemberRole
}

// Dummy members - empty to show empty state, add items to test list
const DUMMY_MEMBERS: Member[] = []

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(DUMMY_MEMBERS)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    title: "" as MemberRole | "",
  })

  const totalMembers = members.length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.title) return

    const newMember: Member = {
      id: crypto.randomUUID(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      title: formData.title as MemberRole,
    }
    setMembers((prev) => [...prev, newMember])
    setFormData({ firstName: "", lastName: "", phone: "", title: "" })
    setOpen(false)
  }

  const getRoleLabel = (value: MemberRole) =>
    MEMBER_ROLES.find((r) => r.value === value)?.label ?? value

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">

      {/* Title row: Member Registry + count on left, Add button on right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Member Registry</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalMembers} {totalMembers === 1 ? "member" : "members"} in this group
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              Add member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add new member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, firstName: e.target.value }))
                  }
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, lastName: e.target.value }))
                  }
                  placeholder="e.g. Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="e.g. +255712345678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Select
                  value={formData.title}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, title: v as MemberRole }))
                  }
                >
                  <SelectTrigger id="title">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_ROLES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Add member</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members list */}
      <div className="flex-1 px-4 md:px-6 pb-6">
        {members.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Users className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No members yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Get started by adding your first member to this group. Click the
                &quot;Add member&quot; button above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <Card
                key={member.id}
                className={cn(
                  "transition-colors hover:bg-accent/30",
                  "cursor-default"
                )}
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.phone || "No phone"}
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
  )
}
