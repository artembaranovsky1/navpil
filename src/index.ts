import express, {type Request, type Response} from 'express';
import {randomUUID} from 'crypto';

type User = {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: Date;
};

type Room = {
    id: string;
    name: string;
    description?: string; // необов'язкове поле
    createdAt: Date;
};

type RoomMember = {
    userId: string;
    roomId: string;
    role: 'owner' | 'member';
    joinedAt: Date;
};

type Item = {
    id: string;
    roomId: string;
    name: string;
    quantity: number;
    price: number;
    addedById: string;
    createdAt: Date;
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let rooms: Room[] = [];

app.get('/', (req: Request, res: Response) => {
    res.status(200)
    res.send('Привіт, сервер працює на Express + TypeScript!');
});

app.get('/rooms', (req: Request, res: Response) => {
    res.json(rooms);
})

app.post('/rooms', (req: Request, res: Response) => {
    const {name, description} = req.body;

    if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({error: 'Need a name'});
    }

    const newRoom: Room = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description,
        createdAt: new Date(),
    }

    rooms.push(newRoom);

    res.status(201).json(newRoom);
})

app.get('/rooms/:roomId', (req: Request, res: Response) => {
    const {roomId} = req.params;

    const foundRoom: Room | undefined = rooms.find((room: Room) => room.id === roomId)

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    res.status(200).json(foundRoom);
})

app.patch('/rooms/:roomId', (req: Request, res: Response) => {
    const {roomId} = req.params;
    const {name, description} = req.body;

    const foundRoom: Room | undefined = rooms.find((room: Room) => room.id === roomId)

    if (!foundRoom) {
        return res.status(404).json({error: 'Room not found'});
    }

    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({error: 'Need a name'});
        }
    }

    const editRoom: Room = {
        id: foundRoom.id,
        name: name !== undefined ? name.trim() : foundRoom.name,
        description: description ?? foundRoom.description,
        createdAt: foundRoom.createdAt,
    }

    const findIndex = rooms.findIndex((room: Room) => room.id === roomId);

    rooms[findIndex] = editRoom;

    res.status(200).json(editRoom);
})

app.delete('/rooms/:roomId', (req: Request, res: Response) => {
    const {roomId} = req.params;

    const findIndex = rooms.findIndex((room: Room) => room.id === roomId);

    if (findIndex === -1) {
        return res.status(404).json({error: 'Room not found'});
    }

    rooms.splice(findIndex, 1);

    res.sendStatus(204);
})

app.get('/health', (req: Request, res: Response) => {
    res.json('ok');
})

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});