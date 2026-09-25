import { User} from "../types.js";

const users: User[] = []

export const findIndex = (userId: string) => {
    return users.findIndex((user: User) => user.id === userId);
}

export const getUsers = () => {
    return users
}

export const getUser = (userId: string) => {
    return users.find((user: User) => user.id === userId)
}

export const createUser = (name: string, email: string) => {
    const newUser = {
        id: crypto.randomUUID(),
        email: email,
        passwordHash: crypto.randomUUID(),
        name: name,
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