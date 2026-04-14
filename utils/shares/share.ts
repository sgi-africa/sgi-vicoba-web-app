import { MemberSharesRow } from "@/interfaces/interface"

export function matchesSearch(row: MemberSharesRow, query: string): boolean {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    return row.name.toLowerCase().includes(q)
}