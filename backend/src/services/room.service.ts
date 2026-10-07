import { Room, RoomMember } from '../types.js';

const rooms: Room[] = [];
const roomMembers: RoomMember[] = [];

export const addMember = (
    roomId: string,
    userId: string,
    role: RoomMember['role'],
): RoomMember => {
    const member: RoomMember = {
        roomId,
        userId,
        role,
        joinedAt: new Date(),
    };

    roomMembers.push(member);

    return member;
};

export const createRoom = (name: string, ownerId: string, description?: string): Room => {
    const newRoom: Room = {
        id: crypto.randomUUID(),
        name,
        description,
        createdAt: new Date(),
    };

    rooms.push(newRoom);
    addMember(newRoom.id, ownerId, 'owner');

    return newRoom;
};

export const getRoomsForUser = (userId: string): Room[] => {
    const myRoomIds = roomMembers
        .filter((member) => member.userId === userId)
        .map((member) => member.roomId);

    return rooms.filter((room) => myRoomIds.includes(room.id));
};

export const findIndex = (roomId: string) => {
    return rooms.findIndex((room: Room) => room.id === roomId);
}

export const deleteRoom = (index: number) => {
    rooms.splice(index, 1);
}

export const getAllRooms = (): Room[] => {
    return rooms;
}

export const getRoomById = (roomId: string) => {
    return rooms.find((room: Room) => room.id === roomId)
}


export const updateRoom =
    (
        foundRoom: Room,
        roomId: string,
        name: string | undefined,
        description: string | undefined
    ) => {
        const editRoom: Room = {
            id: foundRoom.id,
            name: name !== undefined ? name.trim() : foundRoom.name,
            description: description ?? foundRoom.description,
            createdAt: foundRoom.createdAt,
        }

        const index = findIndex(roomId);

        rooms[index] = editRoom;

        return editRoom;
    }