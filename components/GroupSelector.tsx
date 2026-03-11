// components/GroupSelector.tsx
'use client'

import { useState } from "react"
import { Props } from "@/interfaces/interface"


export default function GroupSelector({ groups, onSelect }: Props) {
  const [selectedId, setSelectedId] = useState<number>(groups[0]?.id ?? 0)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setSelectedId(id)
    const group = groups.find((g) => g.id === id)
    if (group) onSelect(group)
  }

  return (
    <select value={selectedId} onChange={handleChange} className="border rounded-lg p-2 text-sm">
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  )
}