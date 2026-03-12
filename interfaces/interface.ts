export interface MemberUser {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

export interface Member {
    id: number;
    userId: number;
    groupId: number;
    title: string;
    isActive: boolean;
    joinedAt: string;
    user: MemberUser;
}

export interface GroupResponse {
    id: number;
    name: string;
    country: string;
    city: string;
    region: string;
    streetAddress: string;
    description: string | null;
    type: string;
    totalBalance: string;
    totalShares: number | null;
    sharePrice: string | null;
    createdById: number;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    members: Member[];
}

export interface Props {
    groups: GroupResponse[]
}

export interface AddMemberFormProps {
    groupId: number
    onSuccess?: () => void
    onClose: () => void
}

export interface GroupState {
    groups: GroupResponse[]
    activeGroup: GroupResponse | null
}

export interface Contribution {
    id: number
    groupId: number
    userId: number
    amount: string
    type: "SAVINGS" | "JAMII" | "PENALTY"
    recordedBy: number
    createdAt: string
    user?: MemberUser
    recorder?: MemberUser
}