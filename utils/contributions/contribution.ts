import { Contribution } from "@/interfaces/interface"

export function getMemberName(contribution: Contribution, unknownLabel: string): string {
    if (contribution.user) {
        return `${contribution.user.firstName} ${contribution.user.lastName}`
    }
    return unknownLabel
}

export function matchesSearch(contribution: Contribution, query: string, unknownLabel: string): boolean {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    const name = getMemberName(contribution, unknownLabel).toLowerCase()
    const type = (contribution.type === "SAVINGS" ? "savings" : "jamii").toLowerCase()
    return name.includes(q) || type.includes(q)
}