import { Member } from "@/interfaces/interface"

export function memberDisplayName(
    members: Member[] | undefined,
    userId: number,
    unknownLabel: string
): string {
    const m = members?.find((x) => x.userId === userId)
    if (!m?.user) return unknownLabel
    return `${m.user.firstName} ${m.user.lastName}`.trim() || unknownLabel
}