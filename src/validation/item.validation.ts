import * as z from "zod";
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const itemCreateSchema = z.object({
    name: z.string().max(20).min(3),
    quantity: z.number().min(1).max(999),
    price: z.number().min(0).max(999999),
});

export const itemUpdateSchema = itemCreateSchema.pick({ name: true, quantity: true, price: true, });


export const itemResponseSchema = z
    .object({
        id: z.uuid().openapi({ example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b' }),
        roomId: z.uuid().openapi({ example: '14og7f1d-0fb0-43bc-bc87-4e538ba5959k' }),
        name: z.string().openapi({ example: 'milk' }),
        quantity: z.number().openapi({ example: '2' }),
        price: z.number().openapi({ example: '40' }),
        addedById: z.uuid().openapi({ example: '23na731d-0fb0-43bc-bk87-4e538ba5958b' }),
        createdAt: z.iso.datetime().openapi({ example: '2026-09-26T07:34:07.777Z' }),
    })
    .openapi('Item');

export const itemParamsSchema = z.object({
    userId: z.uuid().openapi({ example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b' }),
});

export type ItemResponse = z.infer<typeof itemResponseSchema>;