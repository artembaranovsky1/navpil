import {Request, Response} from 'express';
import * as roomService from "../services/room.service.js";
import {roomCreateSchema, roomUpdateSchema} from "../validation/room.validation.js";
import * as z from "zod";

type RoomParams = {
    roomId: string;
};

export const getRooms = (req: Request, res: Response) => {
    const rooms = roomService.getAllRooms();

    res.json(rooms);
};

export const getRoom = (req: Request<RoomParams>, res: Response) => {
    const {roomId} = req.params;

    const foundRoom = roomService.getRoomById(roomId);

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    res.status(200).json(foundRoom);
}

export const createRoom = (req: Request, res: Response) => {
    const result = roomCreateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    const {name, description} = result.data;

    const newRoom = roomService.createRoom(name, description);

    res.status(201).json(newRoom);
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

    const editRoom = roomService.updateRoom(foundRoom, roomId, name, description)

    res.status(200).json(editRoom);
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
