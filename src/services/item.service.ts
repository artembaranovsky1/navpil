import {Item, Room} from "../types.js";

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

export const createItem = (
    roomId: string,
    name: string,
    quantity: number,
    price: number,
    addedById: string,
): Item => {
    const newItem: Item = {
        id: crypto.randomUUID(),
        roomId,
        name: name.trim(),
        quantity,
        price,
        addedById,
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
        createdAt: foundItem.createdAt,
    }

    const index = findIndex(foundItem.id)

    items[index] = newItem

    return newItem;
}

export const deleteItem = (index: number) => {
    items.splice(index, 1);
}