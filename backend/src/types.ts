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
