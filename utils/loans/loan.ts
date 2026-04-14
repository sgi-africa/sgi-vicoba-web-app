import { LoanRequest } from "@/interfaces/interface"

export function getStatusVariant(status: LoanRequest["status"]): "success" | "warning" | "error" {
    switch (status) {
        case "PAID": return "success"
        case "PENDING": return "warning"
        case "OVERDUE": return "error"
        default: return "warning"
    }
}

export function matchesSearch(loan: LoanRequest, query: string): boolean {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    const name = `${loan.requester.firstName} ${loan.requester.lastName}`.toLowerCase()
    const status = loan.status.toLowerCase()
    return name.includes(q) || status.includes(q)
}

export /** Uses `loan.remaining` from API, or totalRepayment − sum(repayments) */
    function getLoanRemaining(loan: LoanRequest): number {
    if (typeof loan.remaining === "number" && !Number.isNaN(loan.remaining)) {
        return loan.remaining
    }
    const total = Number(loan.totalRepayment)
    const paid =
        loan.repayments?.reduce((sum, r) => sum + Number(r.amount), 0) ?? 0
    return Math.max(0, total - paid)
}

export /** Total repaid on a loan (installments); uses `repayments` when present */
    function getTotalRepaidOnLoan(loan: LoanRequest): number {
    if (loan.repayments?.length) {
        return loan.repayments.reduce((sum, r) => sum + Number(r.amount), 0)
    }
    if (loan.status === "PAID") {
        return Number(loan.totalRepayment)
    }
    return Math.max(0, Number(loan.totalRepayment) - getLoanRemaining(loan))
}