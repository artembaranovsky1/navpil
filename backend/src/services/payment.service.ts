import {Payment} from "../types.js";
import {PaymentCreateInput} from "../validation/payment.validation.js";

const payments: Payment[] = [];

export const getPaymentsByRoomId = (roomId: string): Payment[] => {
    return payments.filter((payment) => payment.roomId === roomId);
};

export const createPayment = (roomId: string, createdById: string, data: PaymentCreateInput): Payment => {
    const newPayment: Payment = {
        id: crypto.randomUUID(),
        roomId,
        ...data,
        createdById,
        createdAt: new Date(),
    };

    payments.push(newPayment);

    return newPayment;
};
