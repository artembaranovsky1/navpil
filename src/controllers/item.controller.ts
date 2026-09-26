import {Request, Response} from 'express';
import * as roomService from "../services/room.service.js";
import * as itemService from "../services/item.service.js";
import * as z from "zod";
import {itemCreateSchema, itemUpdateSchema} from "../validation/item.validation.js";

type RoomParams = {
    roomId: string;
    itemId: string;
};

const TEMP_USER_ID = 'temp-user';


export const getItems = (req: Request<RoomParams>, res: Response) => {
    const {roomId} = req.params;

    const room = roomService.getRoomById(roomId);

    if (!room) {
        return res.status(404).json({error: 'Room not found'});
    }

    const items = itemService.getItemsByRoomId(roomId);

    res.status(200).json(items);
}

export const getItem = (req: Request<RoomParams>, res: Response) => {
    const {roomId, itemId} = req.params;

    const room = roomService.getRoomById(roomId);

    const item = itemService.findItem(itemId)

    if (!room) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!item) {
        return res.status(404).json({error: 'Item not found'});
    }

    const itemIsThisRoom = item?.roomId === roomId;

    if (!itemIsThisRoom) {
        return res.status(404).json({error: 'Item not found'});
    }

    const foundItem = itemService.findItem(itemId)

    res.status(200).json(foundItem);
}

export const createItem = (req: Request<RoomParams>, res: Response) => {
    const {roomId} = req.params;

    const result = itemCreateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    const {name, quantity, price} = result.data;

    const room = roomService.getRoomById(roomId);

    if (!room) {
        return res.status(404).json({error: 'Room not found'});
    }

    const newItem = itemService.createItem(roomId, name, quantity, price, TEMP_USER_ID)

    return res.status(201).json(newItem);
}

export const updateItem = (req: Request<RoomParams>, res: Response) => {
    const {roomId, itemId} = req.params;

    const result = itemUpdateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    const {name, quantity, price} = result.data;

    const room = roomService.getRoomById(roomId);

    const item = itemService.findItem(itemId)

    if (!room) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!item) {
        return res.status(404).json({error: 'Item not found'});
    }

    const itemIsThisRoom = item?.roomId === roomId;

    if (!itemIsThisRoom) {
        return res.status(404).json({error: 'Item not found'});
    }

    const updatedItem = itemService.updateItem(item, name, quantity, price)

    return res.status(200).json(updatedItem);
}

export const deleteItem = (req: Request<RoomParams>, res: Response) => {
    const {roomId, itemId} = req.params;

    const room = roomService.getRoomById(roomId);

    const item = itemService.findItem(itemId)

    if (!room) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!item) {
        return res.status(404).json({error: 'Item not found'});
    }

    const itemIsThisRoom = item?.roomId === roomId;

    if (!itemIsThisRoom) {
        return res.status(404).json({error: 'Item not found'});
    }

    itemService.deleteItem(itemId)

    return res.sendStatus(204)
}