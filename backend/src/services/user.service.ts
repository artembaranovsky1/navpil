import {User} from "../types.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {JWT_SECRET} from "../config.js";

export const users: User[] = []

export const findIndex = (userId: string) => {
    return users.findIndex((user: User) => user.id === userId);
}

export const findByEmail = (email: string) => {
    return users.find((user: User) => user.email === email);
}


export const getUsers = () => {
    return users
}

export const getUser = (userId: string) => {
    return users.find((user: User) => user.id === userId)
}

export const createUser = async (name: string, email: string, password: string) => {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        name,
        createdAt: new Date(),
    }

    users.push(newUser);

    return newUser;
}

export const updateUser = (user: User, newName: string) => {
    const editUser = {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: newName,
        createdAt: user.createdAt,
    }

    const index = findIndex(user.id)

    users[index] = editUser

    return editUser;
}

export const deleteUser = (userId: string) => {
    const index = findIndex(userId)

    users.splice(index, 1);
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

