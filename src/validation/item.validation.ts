import * as z from "zod";

export const itemCreateSchema = z.object({
    name: z.string().max(20).min(3),
    quantity: z.number().min(1).max(999).default(1),
    price: z.number().min(0).max(999999),
});

export const itemUpdateSchema = z.object({
    name: z.string().max(20).min(3).optional(),
    quantity: z.number().min(1).max(999).default(1).optional(),
    price: z.number().min(0).max(999999).optional(),
});