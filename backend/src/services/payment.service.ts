import {Payment} from "../types.js";
import {PaymentCreateInput} from "../validation/payment.validation.js";
import {prisma} from "../lib/prisma.js";
import type {Payment as PaymentRow} from "../generated/prisma/client.js";

const toPayment = (row: PaymentRow): Payment => ({
    id: row.id,
    roomId: row.roomId,
    fromId: row.fromId,
    toId: row.toId,
    amount: row.amount.toNumber(),
    createdById: row.createdById,
    createdAt: row.createdAt,
});

export const getPaymentsByRoomId = async (roomId: string): Promise<Payment[]> => {
    const rows = await prisma.payment.findMany({
        where: {roomId},
        orderBy: {createdAt: 'asc'},
    });

    return rows.map(toPayment);
};

export const createPayment = async (roomId: string, createdById: string, data: PaymentCreateInput): Promise<Payment> => {
    const row = await prisma.payment.create({
        data: {roomId, createdById, ...data},
    });

    return toPayment(row);
};
