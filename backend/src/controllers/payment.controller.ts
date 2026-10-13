import type { Request, Response } from 'express';
import * as z from 'zod';
import * as roomService from '../services/room.service.js';
import * as paymentService from '../services/payment.service.js';
import { paymentCreateSchema } from '../validation/payment.validation.js';

type RoomParams = {
    roomId: string;
};

export const getPayments = async (req: Request<RoomParams>, res: Response) => {
    const { roomId } = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (!req.user || !(await roomService.isMember(roomId, req.user.id))) {
        return res.status(403).json({ error: 'You are not a member of this trip' });
    }

    res.json(await paymentService.getPaymentsByRoomId(roomId));
};

export const createPayment = async (req: Request<RoomParams>, res: Response) => {
    const { roomId } = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (!req.user || !(await roomService.isMember(roomId, req.user.id))) {
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

    const memberIds = await roomService.getMemberIds(roomId);

    if (!memberIds.includes(fromId) || !memberIds.includes(toId)) {
        return res.status(422).json({
            error: 'Validation failed',
            details: { fromId: ['Переказ можливий лише між учасниками подорожі'] },
        });
    }

    res.status(201).json(await paymentService.createPayment(roomId, req.user.id, result.data));
};
