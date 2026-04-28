import { Penalty } from "@/interfaces/interface";

export function sumPaidPenaltiesAmount(penalties: Penalty[]) {
    return penalties
        .filter((p) => p.status?.toUpperCase() === "PAID")
        .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
}