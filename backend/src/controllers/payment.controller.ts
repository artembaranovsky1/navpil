import type { Request, Response } from 'express';
import * as z from 'zod';
import * as roomService from '../services/room.service.js';
import * as paymentService from '../services/payment.service.js';
import { paymentCreateSchema } from '../validation/payment.validation.js';

type RoomParams = {
    roomId: string;
};

export const getPayments = (req: Request<RoomParams>, res: Response) => {
    const { roomId } = req.params;

    if (!roomService.getRoomById(roomId)) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (!req.user || !roomService.isMember(roomId, req.user.id)) {
        return res.status(403).json({ error: 'You are not a member of this trip' });
    }

    res.json(paymentService.getPaymentsByRoomId(roomId));
};

export const createPayment = (req: Request<RoomParams>, res: Response) => {
    const { roomId } = req.params;

    if (!roomService.getRoomById(roomId)) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (!req.user || !roomService.isMember(roomId, req.user.id)) {
        return res.status(403).json({ error: 'You are not a member of this trip' });
    }

    const result = paymentCreateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    const { fromId, toId } = result.data;

    if (!roomService.isMember(roomId, fromId) || !roomService.isMember(roomId, toId)) {
        return res.status(422).json({
            error: 'Validation failed',
            details: { fromId: ['Переказ можливий лише між учасниками подорожі'] },
        });
    }

    res.status(201).json(paymentService.createPayment(roomId, req.user.id, result.data));
};
