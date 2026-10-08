export type RoomStatus = 'active' | 'upcoming' | 'past';

export type RoomMemberResponse = {
    id: string;
    name: string;
    role: RoomMember['role']
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
    createdAt: Date;
};

export type RoomMember = {
    userId: string;
    roomId: string;
    role: 'owner' | 'member';
    joinedAt: Date;
};

export type Item = {
    id: string;
    roomId: string;
    name: string;
    quantity: number;
    price: number;
    addedById: string;
    createdAt: Date;
};
