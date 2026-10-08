import type { Request, Response } from 'express';
import * as z from 'zod';
import * as roomService from '../services/room.service.js';
import * as itemService from '../services/item.service.js';
import { itemCreateSchema, itemUpdateSchema } from '../validation/item.validation.js';

type RoomParams = {
    roomId: string;
};

type ItemParams = {
    roomId: string;
    itemId: string;
};

export const getItems = (req: Request<RoomParams>, res: Response) => {
    const { roomId } = req.params;

    if (!roomService.getRoomById(roomId)) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json(itemService.getItemsByRoomId(roomId));
};

export const getItem = (req: Request<ItemParams>, res: Response) => {
    const { roomId, itemId } = req.params;

    if (!roomService.getRoomById(roomId)) {
        return res.status(404).json({ error: 'Room not found' });
    }

    const item = itemService.findItemInRoom(roomId, itemId);

    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
};

export const createItem = (req: Request<RoomParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { roomId } = req.params;

    if (!roomService.getRoomById(roomId)) {
        return res.status(404).json({ error: 'Room not found' });
    }

    if (!roomService.isMember(roomId, req.user.id)) {
        return res.status(403).json({ error: 'You are not a member of this trip' });
    }

    const result = itemCreateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    // Якщо учасників не вказано — витрата ділиться на всіх у подорожі
    const splitBetween = result.data.splitBetween
        ?? roomService.getMemberOfRoom(roomId).map((member) => member.id);

    const strangers = splitBetween.filter(
        (userId) => !roomService.isMember(roomId, userId),
    );

    if (strangers.length > 0) {
        return res.status(422).json({
            error: 'Validation failed',
            details: { splitBetween: ['Можна ділити лише між учасниками подорожі'] },
        });
    }

    const newItem = itemService.createItem(roomId, req.user.id, {...result.data, splitBetween});

    res.status(201).json(newItem);
};

export const updateItem = (req: Request<ItemParams>, res: Response) => {
    const { roomId, itemId } = req.params;

    const result = itemUpdateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    if (!roomService.getRoomById(roomId)) {
        return res.status(404).json({ error: 'Room not found' });
    }

    const item = itemService.findItemInRoom(roomId, itemId);

    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    const { name, quantity, price } = result.data;

    const updatedItem = itemService.updateItem(item, name, quantity, price);

    res.json(updatedItem);
};

export const deleteItem = (req: Request<ItemParams>, res: Response) => {
    const { roomId, itemId } = req.params;

    if (!roomService.getRoomById(roomId)) {
        return res.status(404).json({ error: 'Room not found' });
    }

    const item = itemService.findItemInRoom(roomId, itemId);

    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }

    itemService.deleteItem(itemId);

    res.sendStatus(204);
};