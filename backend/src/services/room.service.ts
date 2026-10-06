import {Room} from "../types.js";

const rooms: Room[] = [];

export const findIndex = (roomId: string) => {
    return rooms.findIndex((room: Room) => room.id === roomId);
}

export const deleteRoom = (index: number) => {
    rooms.splice(index, 1);
}

export const getAllRooms = (): Room[] => {
    return rooms;
}

export const createRoom = (name: string, description?: string) => {
    const newRoom: Room = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description,
        createdAt: new Date(),
    }

    rooms.push(newRoom);

    return newRoom;
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