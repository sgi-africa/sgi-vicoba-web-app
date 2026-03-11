"use client"

import { useState } from "react"
import { Plus, Wallet } from "lucide-react"
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

// Dummy members - replace with backend fetch later
const DUMMY_MEMBERS = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Peter Kamau" },
]

interface Contribution {
  id: string
  memberId: string
  memberName: string
  amount: number
  date: string
}

export default function ContributionsPage() {
  const [open, setOpen] = useState(false)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.memberId || !formData.amount) return

    const member = DUMMY_MEMBERS.find((m) => m.id === formData.memberId)
    if (!member) return

    const newContribution: Contribution = {
      id: crypto.randomUUID(),
      memberId: formData.memberId,
      memberName: member.name,
      amount: Number.parseFloat(formData.amount),
      date: new Date().toLocaleDateString(),
    }
    setContributions((prev) => [...prev, newContribution])
    setFormData({ memberId: "", amount: "" })
    setOpen(false)
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(amount)

  return (
    <div className="flex flex-col flex-1 overflow-auto w-full">
      {/* Title row: Contribution Ledger on left, Add button on right corner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Contribution Ledger
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {contributions.length}{" "}
            {contributions.length === 1 ? "contribution" : "contributions"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 sm:ml-auto">
              <Plus className="size-4" />
              Add contribution
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add contribution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="member">Member</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, memberId: v }))
                  }
                >
                  <SelectTrigger id="member">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {DUMMY_MEMBERS.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (TZS)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, amount: e.target.value }))
                  }
                  placeholder="e.g. 50000"
                  required
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contributions list */}
      <div className="flex-1 px-4 md:px-6 pb-6">
        {contributions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Wallet className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No contributions yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Record your first contribution by clicking the &quot;Add
                contribution&quot; button above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {contributions.map((contribution) => (
              <Card
                key={contribution.id}
                className="transition-colors hover:bg-accent/30 cursor-default"
              >
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">{contribution.memberName}</p>
                    <p className="text-sm text-muted-foreground">
                      {contribution.date}
                    </p>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatAmount(contribution.amount)}
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
