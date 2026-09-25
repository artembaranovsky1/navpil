import {Request, Response} from 'express';
import * as userService from "../services/user.service.js";
import {User} from "../types.js";
import {userCreateSchema, userUpdateSchema} from "../validation/user.validation.js";
import * as z from "zod";

type UserParams = {
    userId: string;
};

export const getUsers = (req: Request, res: Response) => {
    const users = userService.getUsers();

    res.status(200).json(users);
}

export const getUser = (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params

    const user: User | undefined = userService.getUser(userId)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    res.status(200).json(user)
}

export const createUser = (req: Request, res: Response) => {
    const result = userCreateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).send({
            error: 'User not found',
            details: z.flattenError(result.error).fieldErrors,
        })
    }

    const {name, email} = result.data

    const newUser = userService.createUser(name, email)

    res.status(201).json(newUser)
}

export const updateUser = (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params

    const result = userUpdateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).send({
            error: 'User not found',
            details: z.flattenError(result.error).fieldErrors,
        })
    }

    const {name} = result.data

    const user: User | undefined = userService.getUser(userId)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    const updatedUser = userService.updateUser(user, name)

    res.status(200).json(updatedUser)
}

export const deleteUser = (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params

    const user: User | undefined = userService.getUser(userId)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    userService.deleteUser(userId)

    res.sendStatus(204)
}