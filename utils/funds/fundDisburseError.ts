
export function disburseErrorMessage(err: unknown, fallback: string): string {
    if (typeof err === "object" && err !== null && "response" in err) {
        const data = (err as { response?: { data?: { message?: string } } }).response?.data
        if (typeof data?.message === "string") return data.message
    }
    if (err instanceof Error) return err.message
    return fallback
}