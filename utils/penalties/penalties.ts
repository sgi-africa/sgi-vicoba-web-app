import { Penalty } from "@/interfaces/interface"

export function getMemberName(penalty: Penalty, unknownLabel: string): string {
    if (penalty.user) {
        return `${penalty.user.firstName} ${penalty.user.lastName}`
    }
    return unknownLabel
}

export function formatPenaltyType(type: string): string {
    if (!type) return "Other"
    return type.charAt(0) + type.slice(1).toLowerCase()
}

export function matchesSearch(penalty: Penalty, query: string, unknownLabel: string): boolean {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    const name = getMemberName(penalty, unknownLabel).toLowerCase()
    const type = formatPenaltyType(penalty.type ?? "OTHER").toLowerCase()
    const status = (penalty.status?.toUpperCase() === "PAID" ? "paid" : "unpaid").toLowerCase()
    return name.includes(q) || type.includes(q) || status.includes(q)
}