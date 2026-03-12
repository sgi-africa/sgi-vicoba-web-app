export interface MemberUser {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
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
    sharesConfiguredGroupIds: number[]
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

export interface GroupSharesGroup {
    id: number
    name: string
    totalShares: number
    sharePrice: string
}

export interface GroupSharesResponse {
    group: GroupSharesGroup

    totalPurchased: number
    availableShares: number

    purchases: {
        id: number
        groupId: number
        userId: number
        quantity: number
        recordedBy: number
        purchasedAt: string
        user: MemberUser
        recorder: MemberUser
    }[]

    summaryByMember: {
        userId: number
        totalShares: number
        user: MemberUser
    }[]
}

export interface MemberSharesResponse {
    group: GroupSharesGroup
    user: MemberUser
    purchases: {
        id: number
        groupId: number
        userId: number
        quantity: number
        recordedBy: number
        purchasedAt: string
        recorder: MemberUser
    }[]
    totalShares: number
}

export interface MemberOption {
    userId: number
    name: string
}

export interface MemberSharesRow {
    userId: number
    name: string
    totalShares: number
}