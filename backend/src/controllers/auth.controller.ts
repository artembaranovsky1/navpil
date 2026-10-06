import {Request, Response} from "express";
import * as z from "zod";
import * as userService from "../services/user.service.js";
import {loginSchema, registerSchema} from "../validation/auth.validation.js";

export const register = async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        })
    }

    const {name, email, password} = result.data

    if (userService.findByEmail(email)) {
        return res.status(409).json({error: 'Email is already registered'})
    }

    const newUser = await userService.createUser(name, email, password)

    res.status(201).json(userService.toUserResponse(newUser));
}

export const login = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(422).json({
            error: 'Validation failed',
            details: z.flattenError(result.error).fieldErrors,
        })
    }

    const {email, password} = result.data

    const user = userService.findByEmail(email)

    if (!user) {
        return res.status(401).json({error: 'Invalid email or password'})
    }

    const isPasswordValid = await userService.verifyPassword(user, password)

    if (!isPasswordValid) {
        return res.status(401).json({error: 'Invalid email or password'})
    }

    const token = userService.createJwtToken(user)

    res.json({token})
}