import {Room, RoomMember, RoomMemberResponse, RoomResponse, RoomsGroupedResponse, RoomStatus} from '../types.js';
import {RoomCreateInput} from "../validation/room.validation.js";
import * as userService from "./user.service.js";

const rooms: Room[] = [];
const roomMembers: RoomMember[] = [];

const todayString = () => new Date().toISOString().slice(0, 10);

export const addMember = (roomId: string, userId: string, role: RoomMember['role'],): RoomMember => {
    const member: RoomMember = {
        roomId,
        userId,
        role,
        joinedAt: new Date(),
    };

    roomMembers.push(member);

    return member;
};

export const createRoom = (ownerId: string, data: RoomCreateInput): Room => {
    const newRoom: Room = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        createdAt: new Date(),
    };

    rooms.push(newRoom);
    addMember(newRoom.id, ownerId, 'owner');

    return newRoom;
};

export const getMemberOfRoom = (roomId: string) => {
    const result: RoomMemberResponse[] = [];

    for (const member of roomMembers) {
        if (member.roomId !== roomId) continue;

        const user = userService.findById(member.userId);
        if (!user) continue;

        result.push({id: user.id, name: user.name, role: member.role});
    }

    return result;
}

export const toRoomResponse = (room: Room): RoomResponse => {
    return {
        ...room,
        members: getMemberOfRoom(room.id),
        status: getRoomStatus(room, todayString())
    }
}

export const getRoomStatus = (room: Room, today: string): RoomStatus => {
    if (room.endDate && room.endDate < today) {
        return 'past'
    }

    if (room.startDate && room.startDate > today) {
        return 'upcoming'
    }

    return 'active'

}

export const getRoomsForUser = (userId: string): RoomsGroupedResponse => {
    const myRoomIds = roomMembers
        .filter((member) => member.userId === userId)
        .map((member) => member.roomId);

    const myRooms = rooms.filter((room) => myRoomIds.includes(room.id));
    const today = todayString();

    const grouped: RoomsGroupedResponse = {active: [], past: [], upcoming: []}

    for (const room of myRooms) {
        const status = getRoomStatus(room, today);
        grouped[status].push((toRoomResponse(room)))
    }

    grouped.upcoming.sort((a,b) => a.startDate!.localeCompare(b.startDate!))
    grouped.past.sort((a,b) => b.endDate!.localeCompare(a.endDate!))

    return grouped;
};

export const isMember = (roomId: string, userId: string)=> {
    return roomMembers.some((member) => member.userId === userId && member.roomId === roomId);
}

export const findIndex = (roomId: string) => {
    return rooms.findIndex((room: Room) => room.id === roomId);
}

export const deleteRoom = (index: number) => {
    rooms.splice(index, 1);
}

export const getRoomById = (roomId: string) => {
    return rooms.find((room: Room) => room.id === roomId)
}

export const updateRoom = (foundRoom: Room, changes: RoomCreateInput) => {
    const editRoom: Room = {
        ...foundRoom,
        name: changes.name ?? foundRoom.name,
        description: changes.description ?? foundRoom.description,
        startDate: changes.startDate ?? foundRoom.startDate,
        endDate: changes.startDate ?? foundRoom.endDate,
    }

    const index = findIndex(foundRoom.id);
    rooms[index] = editRoom;

    return editRoom;
}