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
    members: {
        id: number;
        userId: number;
        groupId: number;
        title: string;
        isActive: boolean;
        joinedAt: string;
        user: {
            id: number;
            firstName: string;
            lastName: string;
            phone: string;
            email: string;
        };
    }[];
}

export interface Props {
    groups: GroupResponse[]
}