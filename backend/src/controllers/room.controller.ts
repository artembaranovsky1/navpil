import {Request, Response} from 'express';
import * as roomService from "../services/room.service.js";
import {roomCreateSchema, roomUpdateSchema} from "../validation/room.validation.js";
import * as z from "zod";

type RoomParams = {
    roomId: string;
};

export const getRooms = (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json(roomService.getRoomsForUser(req.user.id));
};

export const getRoom = (req: Request<RoomParams>, res: Response) => {
    const {roomId} = req.params;

    const foundRoom = roomService.getRoomById(roomId);

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    res.status(200).json(roomService.toRoomResponse(foundRoom));
}

export const createRoom = (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    const result = roomCreateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    const newRoom = roomService.createRoom(req.user.id, result.data);

    res.status(201).json(roomService.toRoomResponse(newRoom));
}

export const updateRoom = (req: Request<RoomParams>, res: Response) => {
    const {roomId} = req.params;

    const result = roomUpdateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    const {name, description} = result.data;

    const foundRoom = roomService.getRoomById(roomId);

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    const startDate = result.data.startDate ?? foundRoom.startDate;
    const endDate = result.data.endDate ?? foundRoom.endDate;

    const editRoom = roomService.updateRoom(foundRoom, result.data)

    res.status(200).json(roomService.toRoomResponse(editRoom));
}

export const deleteRoom = (req: Request<RoomParams>, res: Response) => {
    const {roomId} = req.params;

    const index = roomService.findIndex(roomId)

    if (index === -1) {
        return res.status(404).json({error: 'Room not found'});
    }

    roomService.deleteRoom(index)

    res.sendStatus(204);
}
