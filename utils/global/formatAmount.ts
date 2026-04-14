export function formatAmount(amount: number | string) {
    return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: "TZS",
        minimumFractionDigits: 0,
    }).format(Number(amount))
}