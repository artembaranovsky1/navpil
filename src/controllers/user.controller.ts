import {Request, Response} from 'express';
import * as userService from "../services/user.service.js";
import {User} from "../types.js";

type UserParams = {
    userId: string;
};

export const getUsers = (req: Request, res: Response) => {
    const users = userService.getUsers();

    res.status(200).json(users);
}

export const getUser = (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params

    const foundUser: User | undefined = userService.getUser(userId)

    if (!foundUser) {
        return res.status(404).send({error: 'User not found'})
    }

    res.status(200).json({user: foundUser})
}

export const createUser = (req: Request, res: Response) => {
    const {name, email} = req.body

    if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).send({error: 'Need a name'})
    }

    if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).send({error: 'Need a email'})
    }

    const newUser = userService.createUser(name, email)

    res.status(201).json({newUser})
}

export const updateUser = (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params
    const {name} = req.body

    if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).send({error: 'Need a name'})
    }

    const user: User | undefined = userService.getUser(userId)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    const updatedUser = userService.updateUser(user, name)

    res.status(200).json({updatedUser})
}

export const deleteUser = (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params

    const user: User | undefined = userService.getUser(userId)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    const index = userService.findIndex(userId)

    userService.deleteUser(index)

    res.sendStatus(204)
}