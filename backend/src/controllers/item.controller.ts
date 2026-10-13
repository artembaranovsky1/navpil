import type {Request, Response} from 'express';
import * as z from 'zod';
import * as roomService from '../services/room.service.js';
import * as itemService from '../services/item.service.js';
import {itemCreateSchema, itemUpdateSchema} from '../validation/item.validation.js';

type RoomParams = {
    roomId: string;
};

type ItemParams = {
    roomId: string;
    itemId: string;
};

type FieldErrors = Record<string, string[]>;

const validateParticipants = async (
    roomId: string,
    paidById?: string,
    splitBetween?: string[],
): Promise<FieldErrors | null> => {
    const memberIds = await roomService.getMemberIds(roomId);
    const errors: FieldErrors = {};

    if (paidById !== undefined && !memberIds.includes(paidById)) {
        errors.paidById = ['Платити може лише учасник подорожі'];
    }

    if (splitBetween !== undefined && splitBetween.some((userId) => !memberIds.includes(userId))) {
        errors.splitBetween = ['Можна ділити лише між учасниками подорожі'];
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

export const getItems = async (req: Request<RoomParams>, res: Response) => {
    const {roomId} = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!req.user || !(await roomService.isMember(roomId, req.user.id))) {
        return res.status(403).json({error: 'You are not a member of this trip'});
    }

    res.json(await itemService.getItemsByRoomId(roomId));
};

export const getItem = async (req: Request<ItemParams>, res: Response) => {
    const {roomId, itemId} = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!req.user || !(await roomService.isMember(roomId, req.user.id))) {
        return res.status(403).json({error: 'You are not a member of this trip'});
    }

    const item = await itemService.findItemInRoom(roomId, itemId);

    if (!item) {
        return res.status(404).json({error: 'Item not found'});
    }

    res.json(item);
};

export const createItem = async (req: Request<RoomParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    const {roomId} = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!(await roomService.isMember(roomId, req.user.id))) {
        return res.status(403).json({error: 'You are not a member of this trip'});
    }

    const result = itemCreateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    // Якщо учасників не вказано — витрата ділиться на всіх у подорожі
    const splitBetween = result.data.splitBetween ?? await roomService.getMemberIds(roomId);
    const paidById = result.data.paidById ?? req.user.id;

    const participantErrors = await validateParticipants(roomId, paidById, splitBetween);

    if (participantErrors) {
        return res.status(422).json({error: 'Validation failed', details: participantErrors});
    }

    const newItem = await itemService.createItem(roomId, req.user.id, {...result.data, paidById, splitBetween});

    res.status(201).json(newItem);
};

export const updateItem = async (req: Request<ItemParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    const {roomId, itemId} = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!(await roomService.isMember(roomId, req.user.id))) {
        return res.status(403).json({error: 'You are not a member of this trip'});
    }

    const item = await itemService.findItemInRoom(roomId, itemId);

    if (!item) {
        return res.status(404).json({error: 'Item not found'});
    }

    const result = itemUpdateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    const participantErrors = await validateParticipants(
        roomId,
        result.data.paidById,
        result.data.splitBetween,
    );

    if (participantErrors) {
        return res.status(422).json({error: 'Validation failed', details: participantErrors});
    }

    const updatedItem = await itemService.updateItem(item, {...result.data});

    res.json(updatedItem);
};

export const deleteItem = async (req: Request<ItemParams>, res: Response) => {
    const {roomId, itemId} = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!req.user || !(await roomService.isMember(roomId, req.user.id))) {
        return res.status(403).json({error: 'You are not a member of this trip'});
    }

    const item = await itemService.findItemInRoom(roomId, itemId);

    if (!item) {
        return res.status(404).json({error: 'Item not found'});
    }

    await itemService.deleteItem(itemId);

    res.sendStatus(204);
};