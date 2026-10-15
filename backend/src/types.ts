export type RoomStatus = 'active' | 'upcoming' | 'past';

export type RoomMemberResponse = {
    id: string;
    name: string;
    email: string;
    role: RoomMember['role'];
    joinedAt: Date;
}

export type RoomResponse = Room & {
    members: RoomMemberResponse[];
    status: RoomStatus;
};


export type RoomsGroupedResponse = Record<RoomStatus, RoomResponse[]>;

export type User = {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: Date;
};

export type Room = {
    id: string;
    name: string;
    description?: string; // необов'язкове поле
    startDate?: string;
    endDate?: string;
    inviteCode: string;
    createdAt: Date;
};

export type RoomMember = {
    userId: string;
    roomId: string;
    role: 'owner' | 'member';
    joinedAt: Date;
};

export const ITEM_CATEGORIES = [
    'food',
    'transport',
    'housing',
    'entertainment',
    'shopping',
    'other',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type Item = {
    id: string;
    roomId: string;
    name: string;
    description?: string;
    amount: number;
    category: ItemCategory;
    addedById: string;
    paidById: string;
    date: string;
    splitBetween: string[];
    createdAt: Date;
};

export type Payment = {
    id: string;
    roomId: string;
    fromId: string;
    toId: string;
    amount: number;
    createdById: string;
    createdAt: Date;
};

export type RoomSummary = {
    // скільки витратили всі учасники разом
    total: number;
    // скільки ще мають повернути користувачу (+) чи має віддати він (−)
    myBalance: number;
};

export type RoomsSummaryResponse = {
    myBalance: number;
    totalSpent: number;
    tripsThisYear: number;
    trips: Record<string, RoomSummary>;
};
