import {Room, RoomMember, RoomMemberResponse, RoomResponse, RoomsGroupedResponse, RoomStatus} from '../types.js';
import {RoomCreateInput, RoomUpdateInput} from "../validation/room.validation.js";
import {randomInt} from 'node:crypto';
import {prisma} from "../lib/prisma.js";

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

const todayString = () => new Date().toISOString().slice(0, 10);

// "2026-05-12" <-> Date (колонки @db.Date зберігаються без часу)
const toDbDate = (date: string | undefined): Date | undefined => date ? new Date(date) : undefined;
const fromDbDate = (date: Date | null): string | undefined => date ? date.toISOString().slice(0, 10) : undefined;

type RoomRow = {
    id: string;
    name: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    inviteCode: string;
    createdAt: Date;
};

type MemberRow = {
    role: RoomMember['role'];
    joinedAt: Date;
    user: { id: string; name: string; email: string };
};

const memberUserSelect = {select: {id: true, name: true, email: true}};

const membersInclude = {
    members: {
        include: {user: memberUserSelect},
        orderBy: {joinedAt: 'asc' as const},
    },
};

const toRoom = (row: RoomRow): Room => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    startDate: fromDbDate(row.startDate),
    endDate: fromDbDate(row.endDate),
    inviteCode: row.inviteCode,
    createdAt: row.createdAt,
});

const toMemberResponse = (member: MemberRow): RoomMemberResponse => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    joinedAt: member.joinedAt,
});

const buildRoomResponse = (row: RoomRow & { members: MemberRow[] }, today = todayString()): RoomResponse => {
    const room = toRoom(row);

    return {
        ...room,
        members: row.members.map(toMemberResponse),
        status: getRoomStatus(room, today),
    };
};

export const addMember = async (roomId: string, userId: string, role: RoomMember['role']): Promise<void> => {
    await prisma.roomMember.create({data: {roomId, userId, role}});
};

export const createRoom = async (ownerId: string, data: RoomCreateInput): Promise<Room> => {
    const row = await prisma.room.create({
        data: {
            name: data.name,
            description: data.description,
            startDate: toDbDate(data.startDate),
            endDate: toDbDate(data.endDate),
            inviteCode: await generateInviteCode(),
            members: {create: {userId: ownerId, role: 'owner'}},
        },
    });

    return toRoom(row);
};

export const getMemberOfRoom = async (roomId: string): Promise<RoomMemberResponse[]> => {
    const members = await prisma.roomMember.findMany({
        where: {roomId},
        include: {user: memberUserSelect},
        orderBy: {joinedAt: 'asc'},
    });

    return members.map(toMemberResponse);
}

export const getMemberIds = async (roomId: string): Promise<string[]> => {
    const members = await prisma.roomMember.findMany({where: {roomId}, select: {userId: true}});
    return members.map((member) => member.userId);
}

export const toRoomResponse = async (room: Room): Promise<RoomResponse> => {
    return {
        ...room,
        members: await getMemberOfRoom(room.id),
        status: getRoomStatus(room, todayString()),
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

export const getRoomsForUser = async (userId: string): Promise<RoomsGroupedResponse> => {
    const rows = await prisma.room.findMany({
        where: {members: {some: {userId}}},
        include: membersInclude,
        orderBy: {createdAt: 'desc'},
    });

    const today = todayString();
    const grouped: RoomsGroupedResponse = {active: [], past: [], upcoming: []}

    for (const row of rows) {
        const room = buildRoomResponse(row, today);
        grouped[room.status].push(room);
    }

    grouped.upcoming.sort((a, b) => a.startDate!.localeCompare(b.startDate!))
    grouped.past.sort((a, b) => b.endDate!.localeCompare(a.endDate!))

    return grouped;
};

export const isMember = async (roomId: string, userId: string): Promise<boolean> => {
    const member = await prisma.roomMember.findUnique({
        where: {roomId_userId: {roomId, userId}},
        select: {userId: true},
    });

    return member !== null;
}

export const getMemberRole = async (roomId: string, userId: string): Promise<RoomMember['role'] | undefined> => {
    const member = await prisma.roomMember.findUnique({
        where: {roomId_userId: {roomId, userId}},
        select: {role: true},
    });

    return member?.role;
}

const generateInviteCode = async (): Promise<string> => {
    let code: string;

    do {
        code = '';
        for (let i = 0; i < CODE_LENGTH; i++) {
            code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
        }
    } while (await prisma.room.findUnique({where: {inviteCode: code}, select: {id: true}})); // раптом такий уже є

    return code;
};

export const findRoomByCode = async (code: string): Promise<Room | undefined> => {
    const row = await prisma.room.findUnique({where: {inviteCode: code}});
    return row ? toRoom(row) : undefined;
}

export const deleteRoom = async (roomId: string): Promise<void> => {
    await prisma.room.delete({where: {id: roomId}});
}

export const getRoomById = async (roomId: string): Promise<Room | undefined> => {
    const row = await prisma.room.findUnique({where: {id: roomId}});
    return row ? toRoom(row) : undefined;
}

export const updateRoom = async (foundRoom: Room, changes: RoomUpdateInput): Promise<Room> => {
    const row = await prisma.room.update({
        where: {id: foundRoom.id},
        data: {
            name: changes.name,
            description: changes.description,
            startDate: toDbDate(changes.startDate),
            endDate: toDbDate(changes.endDate),
        },
    });

    return toRoom(row);
}

// Чи бере учасник участь у витратах чи переказах подорожі — такого не можна видаляти
export const hasActivity = async (roomId: string, userId: string): Promise<boolean> => {
    const [items, payments] = await Promise.all([
        prisma.item.count({
            where: {
                roomId,
                OR: [{addedById: userId}, {paidById: userId}, {splitBetween: {has: userId}}],
            },
        }),
        prisma.payment.count({
            where: {roomId, OR: [{fromId: userId}, {toId: userId}]},
        }),
    ]);

    return items > 0 || payments > 0;
}

export const removeMember = async (roomId: string, userId: string): Promise<void> => {
    await prisma.roomMember.delete({where: {roomId_userId: {roomId, userId}}});
}
