import * as z from "zod";

export const userCreateSchema = z.object({
    name: z.string().trim().max(20).min(3),
    email: z.email()
});

export const userUpdateSchema = z.object({
    name: z.string().trim().max(20).min(3)
});