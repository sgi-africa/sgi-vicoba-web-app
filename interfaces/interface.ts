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

export interface AddPenaltyFormProps {
    groupId: number
    members: Member[]
    onSuccess?: () => void
    onClose: () => void
}

export interface AddLoanFormProps {
    groupId: number
    members: Member[]
    onSuccess?: () => void
    onClose: () => void
}

export interface Penalty {
    id: number
    groupId: number
    userId: number
    meetingId: number | null
    type: string
    reason: string | null
    amount: string
    status: string
    recordedBy: number
    paidAt: string | null
    createdAt: string
    user: MemberUser
    recorder: MemberUser
    meeting: unknown
}

export interface AddLoanPayload {
    userId: number
    principal: number
    interestRate: number
    durationMonths: number
    reason?: string
}

export enum LoanStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
}
export interface LoanRequest {
    id: number;
    groupId: number;
    requestedBy: number;
    principal: string;
    interestRate: string;
    durationMonths: number;
    interestAmount: string;
    totalRepayment: string;
    monthlyInstallment: string;
    reason: string | null;
    rejectionReason: string | null;
    status: LoanStatus;
    approvedBy: number | null;
    approvedAt: string | null;
    createdAt: string;
    dueDate: string;
    group: {
        id: number;
        name: string;
    };
    requester: MemberUser
    approver: MemberUser | null
    repayments?: Repayment[]
    remaining?: number
}

export interface AddMeetingFormProps {
    groupId: number
    members: Member[]
    onSuccess?: () => void
    onClose: () => void
}

export interface AddMeetingPayload {
    topic: string
    attendeeIds: number[]
    meetingDate: string
    nextMeetingDate: string
    resolutions?: string
}

export interface GroupMeetingsResponse {
    id: number;
    groupId: number;
    meetingDate: string;
    nextMeetingDate: string;
    topic: string;
    resolutions: string;
    recordedBy: number;
    createdAt: string;
    recorder: MemberUser;
    attendees: {
        id: number;
        meetingId: number;
        userId: number;
        user: MemberUser;
    }[];
}

export interface EditGroupFormProps {
    group: GroupResponse
    onSuccess?: (updatedGroup: GroupResponse) => void
    className?: string
}

export interface ContentContainerProps {
    children: React.ReactNode
    className?: string
}

export interface PageHeaderProps {
    title: string
    description?: string
    children?: React.ReactNode
    className?: string
}

export interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    ariaLabel?: string
}

export type StatusVariant = "success" | "warning" | "error" | "default"

export interface StatusBadgeProps {
    label: string
    variant?: StatusVariant
    className?: string
}

export interface Repayment {
    id: number;
    amount: string;
    paidAt: string;
}

export interface LoanRepaymentSummary {
    repayment: Repayment;
    loan: LoanRequest;

    totalPaid: number;
    remaining: number;
    isFullyPaid: boolean;
}

export type ResetPasswordPayload = {
    token: string
    password: string
}