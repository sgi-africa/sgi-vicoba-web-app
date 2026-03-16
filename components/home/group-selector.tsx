'use client'

import { useDispatch } from "react-redux"
import { useAppSelector } from "@/hooks/redux"
import { setActiveGroup } from "@/store/groupSlice"
import { Props } from "@/interfaces/interface"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function GroupSelector({ groups }: Props) {
  const dispatch = useDispatch()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)

  const selectedId = activeGroup && groups.some((g) => g.id === activeGroup.id)
    ? String(activeGroup.id)
    : String(groups[0]?.id ?? "")

  const handleChange = (value: string) => {
    const id = Number(value)
    const group = groups.find((g) => g.id === id)
    if (group) {
      dispatch(setActiveGroup(group))
    }
  }

  return (
    <Select value={selectedId} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] h-8 text-xs bg-card border-border/60">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {groups.map((g) => (
          <SelectItem key={g.id} value={String(g.id)}>
            {g.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
