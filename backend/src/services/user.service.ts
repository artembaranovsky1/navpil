import {User} from "../types.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {JWT_SECRET} from "../config.js";
import {prisma} from "../lib/prisma.js";

export const findByEmail = (email: string): Promise<User | null> => {
    return prisma.user.findUnique({where: {email}});
}

export const findById = (userId: string): Promise<User | null> => {
    return prisma.user.findUnique({where: {id: userId}});
}

export const getUsers = (): Promise<User[]> => {
    return prisma.user.findMany({orderBy: {createdAt: 'asc'}});
}

export const getUser = findById;

export const createUser = async (name: string, email: string, password: string): Promise<User> => {
    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.user.create({
        data: {name, email, passwordHash},
    });
}

export const updateUser = (user: User, newName: string): Promise<User> => {
    return prisma.user.update({
        where: {id: user.id},
        data: {name: newName},
    });
}

export const deleteUser = async (userId: string): Promise<void> => {
    await prisma.user.delete({where: {id: userId}});
}

export const verifyPassword = async (user: User, password: string): Promise<boolean> => {
    return bcrypt.compare(password, user.passwordHash)
}

export const createJwtToken = (user: User) => {
    return jwt.sign({
            userId: user.id,
        },
        JWT_SECRET,
        {
            expiresIn: 60 * 60
        }
    )
}

export const toUserResponse = (user: User) => {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
    }
}
