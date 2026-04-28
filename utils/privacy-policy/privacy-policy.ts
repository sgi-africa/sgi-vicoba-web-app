export function formatPolicyDate(iso: string) {
    try {
        return new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(iso + "T12:00:00.000Z"))
    } catch {
        return iso
    }
}