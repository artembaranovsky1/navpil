import {Request, Response} from 'express';
import * as roomService from "../services/room.service.js";
import * as itemService from "../services/item.service.js";

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
    const {name, quantity = 1, price} = req.body;

    const room = roomService.getRoomById(roomId);

    if (!room) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({error: 'Name is required'});
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({error: 'Quantity must be a positive integer'});
    }

    if (!Number.isInteger(price) || price < 0) {
        return res.status(400).json({error: 'Price must be a positive integer'});
    }

    const newItem = itemService.createItem(roomId, name, quantity, price, TEMP_USER_ID)

    return res.status(201).json(newItem);
}


export const updateItem = (req: Request<RoomParams>, res: Response) => {
    const {roomId, itemId} = req.params;
    const {name, quantity, price} = req.body;

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

    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({error: 'Name is required'});
        }
    }

    if (quantity !== undefined) {
        if (typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({error: 'Quantity must be a positive integer'});
        }
    }

    if (price !== undefined) {
        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({error: 'Price must be a positive integer'});
        }

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

    const index = itemService.findIndex(itemId)

    itemService.deleteItem(index)

    return res.sendStatus(204)
}