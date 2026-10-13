import {Request, Response} from 'express';
import * as userService from "../services/user.service.js";
import {userCreateSchema, userUpdateSchema} from "../validation/user.validation.js";
import * as z from "zod";

type UserParams = {
    userId: string;
};


export const getUsers = async (req: Request, res: Response) => {
    const users = await userService.getUsers();

    res.status(200).json(users.map(userService.toUserResponse));
}

export const getUser = async (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params

    const user = await userService.getUser(userId)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    res.status(200).json(userService.toUserResponse(user))
}

export const getMe = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).send({error: 'Unauthorized'})
    }

    const user = await userService.findById(req.user.id)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    res.status(200).json(userService.toUserResponse(user))
}

export const createUser = async (req: Request, res: Response) => {
    const result = userCreateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).send({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        })
    }

    const {name, email, password} = result.data

    if (await userService.findByEmail(email)) {
        return res.status(409).json({error: 'Email is already registered'})
    }

    const newUser = await userService.createUser(name, email, password)

    res.status(201).json(userService.toUserResponse(newUser))
}

export const updateUser = async (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params

    // змінювати можна лише власний профіль
    if (!req.user || req.user.id !== userId) {
        return res.status(403).send({error: 'You can only edit your own profile'})
    }

    const result = userUpdateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).send({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        })
    }

    const {name} = result.data

    const user = await userService.getUser(userId)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    const updatedUser = await userService.updateUser(user, name)

    res.status(200).json(userService.toUserResponse(updatedUser))
}

export const deleteUser = async (req: Request<UserParams>, res: Response) => {
    const {userId} = req.params

    // видаляти можна лише власний акаунт
    if (!req.user || req.user.id !== userId) {
        return res.status(403).send({error: 'You can only delete your own account'})
    }

    const user = await userService.getUser(userId)

    if (!user) {
        return res.status(404).send({error: 'User not found'})
    }

    await userService.deleteUser(userId)

    res.sendStatus(204)
}
