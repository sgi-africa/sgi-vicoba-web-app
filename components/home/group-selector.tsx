'use client'

import { useDispatch } from "react-redux"
import { useAppSelector } from "@/hooks/redux"
import { setActiveGroup } from "@/store/groupSlice"
import { Props } from "@/interfaces/interface"

export default function GroupSelector({ groups }: Props) {
  const dispatch = useDispatch()
  const activeGroup = useAppSelector((state) => state.group.activeGroup)

  // Drive value from Redux so it updates immediately when a new group is set active (e.g. after create)
  const selectedId = activeGroup && groups.some((g) => g.id === activeGroup.id)
    ? activeGroup.id
    : groups[0]?.id ?? ""

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    const group = groups.find((g) => g.id === id)
    if (group) {
      dispatch(setActiveGroup(group))
    }
  }

  return (
    <select
      value={selectedId}
      onChange={handleChange}
      className="border rounded-lg p-2 text-sm"
    >
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  )
}