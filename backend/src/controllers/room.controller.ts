import {Request, Response} from 'express';
import * as roomService from "../services/room.service.js";
import {joinRoomSchema, roomCreateSchema, roomUpdateSchema} from "../validation/room.validation.js";
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

    if (!req.user || !roomService.isMember(roomId, req.user.id)) {
        return res.status(403).json({error: 'You are not a member of this trip'});
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

export const joinRoom = (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    const result = joinRoomSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }

    const room = roomService.findRoomByCode(result.data.code);

    if (!room) {
        return res.status(404).json({error: 'Invalid invite code'});
    }

    if (!roomService.isMember(room.id, req.user.id)) {
        roomService.addMember(room.id, req.user.id, 'member')
    }

    res.status(200).json(roomService.toRoomResponse(room));
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
