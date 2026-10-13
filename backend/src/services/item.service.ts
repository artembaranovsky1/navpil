import {Item} from "../types.js";
import {ItemCreateInput, ItemUpdateInput} from "../validation/item.validation.js";
import {prisma} from "../lib/prisma.js";
import type {Item as ItemRow} from "../generated/prisma/client.js";

const toItem = (row: ItemRow): Item => ({
    id: row.id,
    roomId: row.roomId,
    name: row.name,
    description: row.description ?? undefined,
    amount: row.amount.toNumber(),
    category: row.category,
    addedById: row.addedById,
    paidById: row.paidById,
    date: row.date.toISOString().slice(0, 10),
    splitBetween: row.splitBetween,
    createdAt: row.createdAt,
});

export const getItemsByRoomId = async (roomId: string): Promise<Item[]> => {
    const rows = await prisma.item.findMany({
        where: {roomId},
        orderBy: {createdAt: 'asc'},
    });

    return rows.map(toItem);
}

export const findItemInRoom = async (roomId: string, itemId: string): Promise<Item | undefined> => {
    const row = await prisma.item.findFirst({where: {id: itemId, roomId}});
    return row ? toItem(row) : undefined;
};

export const createItem = async (roomId: string, addedById: string, data: ItemCreateInput): Promise<Item> => {
    const row = await prisma.item.create({
        data: {
            roomId,
            addedById,
            name: data.name,
            description: data.description,
            amount: data.amount,
            category: data.category,
            date: new Date(data.date),
            paidById: data.paidById ?? addedById,
            splitBetween: data.splitBetween ?? [],
        },
    });

    return toItem(row);
};

export const updateItem = async (foundItem: Item, data: ItemUpdateInput): Promise<Item> => {
    const row = await prisma.item.update({
        where: {id: foundItem.id},
        data: {
            name: data.name,
            description: data.description,
            amount: data.amount,
            category: data.category,
            paidById: data.paidById,
            date: data.date !== undefined ? new Date(data.date) : undefined,
            splitBetween: data.splitBetween,
        },
    });

    return toItem(row);
}

export const deleteItem = async (itemId: string): Promise<void> => {
    await prisma.item.delete({where: {id: itemId}});
}
