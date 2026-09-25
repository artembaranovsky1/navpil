import * as z from "zod";

export const roomCreateSchema = z.object({
    name: z.string().trim().max(20).min(3),
    description: z.string().max(200).optional(),
});

export const roomUpdateSchema = z.object({
    name: z.string().trim().max(20).min(3).optional(),
    description: z.string().max(200).optional(),
});