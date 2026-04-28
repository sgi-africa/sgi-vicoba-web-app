import { LoanRequest } from "@/interfaces/interface"

/** Sums repayment amounts where the installment has a recorded `paidAt`. */
export function sumLoanRepaymentsWithPaidAt(loans: LoanRequest[]) {
    return loans.reduce((total, loan) => {
        const paid = (loan.repayments ?? [])
            .filter((r) => Boolean(r.paidAt))
            .reduce((s, r) => s + Number(r.amount ?? 0), 0)
        return total + paid
    }, 0)
}