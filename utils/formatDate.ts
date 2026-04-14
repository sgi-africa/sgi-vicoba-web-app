export function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-TZ", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    } catch {
        return dateStr
    }
}