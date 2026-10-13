import {Request, Response} from 'express';
import * as roomService from "../services/room.service.js";
import {joinRoomSchema, roomCreateSchema, roomUpdateSchema} from "../validation/room.validation.js";
import * as z from "zod";

type RoomParams = {
    roomId: string;
};

type MemberParams = {
    roomId: string;
    userId: string;
};

export const getRooms = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json(await roomService.getRoomsForUser(req.user.id));
};

export const getRoom = async (req: Request<RoomParams>, res: Response) => {
    const {roomId} = req.params;

    const foundRoom = await roomService.getRoomById(roomId);

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!req.user || !(await roomService.isMember(roomId, req.user.id))) {
        return res.status(403).json({error: 'You are not a member of this trip'});
    }

    res.status(200).json(await roomService.toRoomResponse(foundRoom));
}

export const createRoom = async (req: Request, res: Response) => {
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

    const newRoom = await roomService.createRoom(req.user.id, result.data);

    res.status(201).json(await roomService.toRoomResponse(newRoom));
}

export const joinRoom = async (req: Request, res: Response) => {
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

    const room = await roomService.findRoomByCode(result.data.code);

    if (!room) {
        return res.status(404).json({error: 'Invalid invite code'});
    }

    if (!(await roomService.isMember(room.id, req.user.id))) {
        await roomService.addMember(room.id, req.user.id, 'member')
    }

    res.status(200).json(await roomService.toRoomResponse(room));
}

export const updateRoom = async (req: Request<RoomParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    const {roomId} = req.params;

    const result = roomUpdateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        });
    }
    const foundRoom = await roomService.getRoomById(roomId);

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (!(await roomService.isMember(roomId, req.user.id))) {
        return res.status(403).json({error: 'You are not a member of this trip'});
    }

    const editRoom = await roomService.updateRoom(foundRoom, result.data)

    res.status(200).json(await roomService.toRoomResponse(editRoom));
}

export const deleteRoom = async (req: Request<RoomParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    const {roomId} = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({error: 'Room not found'});
    }

    // видаляти подорож може лише її власник
    if (await roomService.getMemberRole(roomId, req.user.id) !== 'owner') {
        return res.status(403).json({error: 'Only the owner can delete this trip'});
    }

    await roomService.deleteRoom(roomId)

    res.sendStatus(204);
}

export const removeMember = async (req: Request<MemberParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    const {roomId, userId} = req.params;

    if (!(await roomService.getRoomById(roomId))) {
        return res.status(404).json({error: 'Room not found'});
    }

    // видаляти учасників може лише організатор
    if (await roomService.getMemberRole(roomId, req.user.id) !== 'owner') {
        return res.status(403).json({error: 'Only the owner can remove members'});
    }

    if (userId === req.user.id) {
        return res.status(422).json({error: 'Owner cannot remove themselves'});
    }

    if (!(await roomService.isMember(roomId, userId))) {
        return res.status(404).json({error: 'Member not found'});
    }

    if (await roomService.hasActivity(roomId, userId)) {
        return res.status(409).json({error: 'Member has expenses or payments in this trip'});
    }

    await roomService.removeMember(roomId, userId);

    res.sendStatus(204);
}
