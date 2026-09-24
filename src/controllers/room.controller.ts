import {Request, Response} from 'express';
import * as roomService from "../services/room.service.js";
import {Room} from "../types.js";

export const getRooms = (req: Request, res: Response) => {
    const rooms = roomService.getAllRooms();

    res.json(rooms);
};

export const getRoom = (req: Request, res: Response) => {
    const {roomId} = req.params;

    const foundRoom = roomService.getRoomById(roomId);

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    res.status(200).json(foundRoom);
}


export const createRoom = (req: Request, res: Response) => {
    const {name, description} = req.body;

    if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({error: 'Need a name'});
    }

    const newRoom = roomService.createRoom(name, description);

    res.status(201).json(newRoom);
}


export const updateRoom = (req: Request, res: Response) => {
    const {roomId} = req.params;
    const {name, description} = req.body;

    const foundRoom = roomService.getRoomById(roomId);

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({error: 'Need a name'});
        }
    }

    const editRoom = roomService.updateRoom(foundRoom, roomId, name, description)

    res.status(200).json(editRoom);
}

export const deleteRoom = (req: Request, res: Response) => {
    const {roomId} = req.params;

    const index = roomService.findIndex(roomId)

    if (index === -1) {
        return res.status(404).json({error: 'Room not found'});
    }

    roomService.deleteRoom(index)

    res.sendStatus(204);
}

