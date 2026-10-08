import {Item, Room} from "../types.js";
import {ItemCreateInput} from "../validation/item.validation.js";

const items: Item[] = [];

export const findItem = (itemId: string) => {
    return items.find(item => item.id === itemId);
}

export const findIndex = (itemId: string) => {
    return items.findIndex((item: Item) => item.id === itemId);
}

export const getItemsByRoomId = (roomId: string): Item[] => {
    return items.filter((item: Item) => item.roomId === roomId);
}

export const findItemInRoom = (roomId: string, itemId: string): Item | undefined => {
    return items.find((item) => item.id === itemId && item.roomId === roomId);
};

export const createItem = (
    roomId: string,
    addedById: string,
    data: ItemCreateInput,
): Item => {
    const newItem: Item = {
        id: crypto.randomUUID(),
        roomId,
        addedById,
        ...data,
        quantity: data.quantity ?? 1,
        splitBetween: data.splitBetween ?? [],
        createdAt: new Date(),
    };

    items.push(newItem);

    return newItem;
};

export const updateItem = (foundItem: Item, newName: string | undefined, newQuantity: number | undefined, newPrice: number | undefined) => {
    const newItem: Item = {
        id: foundItem.id,
        roomId: foundItem.roomId,
        name: newName !== undefined ? newName : foundItem.name,
        quantity: newQuantity !== undefined ? newQuantity : foundItem.quantity,
        price: newPrice !== undefined ? newPrice : foundItem.price,
        addedById: foundItem.addedById,
        date: foundItem.date,
        splitBetween: foundItem.splitBetween,
        createdAt: foundItem.createdAt,
    }

    const index = findIndex(foundItem.id)

    items[index] = newItem

    return newItem;
}

export const deleteItem = (itemId: string) => {
    const index = findIndex(itemId)

    items.splice(index, 1);
}