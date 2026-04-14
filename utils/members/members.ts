import { Member } from "@/interfaces/interface";

const MEMBER_ROLE_KEYS = ["chairperson", "treasurer", "secretary", "member"] as const;

export function getRoleLabel(value: string, t: (key: string) => string) {
    const v = value?.toLowerCase();
    const key = MEMBER_ROLE_KEYS.find((r) => r === v);
    return key ? t(`members.${key}`) : value;
}


export function getRoleBadgeClassName(role: string) {
    switch (role?.toLowerCase()) {
        case "chairperson":
            return "bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/20";
        case "treasurer":
            return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20";
        case "secretary":
            return "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/20";
        default:
            return "bg-muted text-muted-foreground ring-border/50";
    }
}


export function matchesSearch(member: Member, query: string): boolean {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
    const phone = (member.user.phone ?? "").toLowerCase();
    return fullName.includes(q) || phone.includes(q);
}