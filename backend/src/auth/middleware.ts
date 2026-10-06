import type {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import * as userService from '../services/user.service.js';
import {JWT_SECRET} from '../config.js';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({error: 'Authorization header is missing'});
    };

    const [shema, token] = authorization.split(' ');

    if (shema !== 'Bearer' || !token) {
        return res.status(401).json({error: 'Authorization header must be: Bearer <token>'});
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        if (typeof payload === 'string' || typeof payload.userId !== 'string') {
            return res.status(401).json({error: 'Invalid token'});
        }

        const user = userService.getUser(payload.userId);

        if (!user) {
            return res.status(401).json({error: 'User no longer exists'});
        }

        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
        }

        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({error: 'Token expired'});
        }

        if ( error instanceof jwt.JsonWebTokenError ) {
            return res.status(401).json({error: 'Invalid token'});
        }

        next(error);
    }
}