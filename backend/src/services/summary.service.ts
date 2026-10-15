import {prisma} from "../lib/prisma.js";
import {RoomSummary, RoomsSummaryResponse} from "../types.js";

// Рахуємо в копійках, щоб не накопичувати похибку float.
// Логіка поділу збігається з frontend/src/utils/settle.ts — інакше баланси на клієнті й сервері розійдуться.
const toCents = (amount: { toString(): string }): number => Math.round(Number(amount) * 100);
const fromCents = (cents: number): number => cents / 100;

const splitCents = (cents: number, count: number): number[] => {
    const base = Math.floor(cents / count);
    const remainder = cents - base * count;

    return Array.from({length: count}, (_, index) => base + (index < remainder ? 1 : 0));
};

// Підсумки по всіх подорожах користувача: скільки витрачено і який у нього баланс
// (з урахуванням уже зроблених переказів)
export const getSummaryForUser = async (userId: string): Promise<RoomsSummaryResponse> => {
    const rooms = await prisma.room.findMany({
        where: {members: {some: {userId}}},
        select: {
            id: true,
            startDate: true,
            createdAt: true,
            members: {select: {userId: true}, orderBy: {joinedAt: 'asc'}},
        },
    });

    const roomIds = rooms.map((room) => room.id);

    const [items, payments] = await Promise.all([
        prisma.item.findMany({
            where: {roomId: {in: roomIds}},
            select: {roomId: true, amount: true, paidById: true, splitBetween: true},
        }),
        prisma.payment.findMany({
            where: {roomId: {in: roomIds}, OR: [{fromId: userId}, {toId: userId}]},
            select: {roomId: true, amount: true, fromId: true, toId: true},
        }),
    ]);

    const totalCents: Record<string, number> = {};
    const balanceCents: Record<string, number> = {};
    const memberIds: Record<string, string[]> = {};

    for (const room of rooms) {
        totalCents[room.id] = 0;
        balanceCents[room.id] = 0;
        memberIds[room.id] = room.members.map((member) => member.userId);
    }

    for (const item of items) {
        const cents = toCents(item.amount);
        const participants = item.splitBetween.length > 0 ? item.splitBetween : memberIds[item.roomId];

        totalCents[item.roomId] += cents;

        if (item.paidById === userId) {
            balanceCents[item.roomId] += cents;
        }

        const myIndex = participants.indexOf(userId);
        if (myIndex !== -1) {
            balanceCents[item.roomId] -= splitCents(cents, participants.length)[myIndex];
        }
    }

    // переказ від мене зменшує мій борг (+), переказ мені — зменшує те, що мені винні (−)
    for (const payment of payments) {
        const cents = toCents(payment.amount);

        if (payment.fromId === userId) balanceCents[payment.roomId] += cents;
        if (payment.toId === userId) balanceCents[payment.roomId] -= cents;
    }

    const currentYear = new Date().getUTCFullYear();
    const trips: Record<string, RoomSummary> = {};

    for (const room of rooms) {
        trips[room.id] = {
            total: fromCents(totalCents[room.id]),
            myBalance: fromCents(balanceCents[room.id]),
        };
    }

    return {
        myBalance: fromCents(Object.values(balanceCents).reduce((sum, cents) => sum + cents, 0)),
        totalSpent: fromCents(Object.values(totalCents).reduce((sum, cents) => sum + cents, 0)),
        tripsThisYear: rooms.filter((room) => (room.startDate ?? room.createdAt).getUTCFullYear() === currentYear).length,
        trips,
    };
};
