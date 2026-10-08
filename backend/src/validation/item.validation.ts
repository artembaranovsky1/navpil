import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';
import {roomParamsSchema} from "./room.validation.js";

const todayString = (): string => new Date().toISOString().slice(0, 10);

extendZodWithOpenApi(z);

export const itemCreateSchema = z
    .object({
        name: z.string().min(3).max(20).openapi({example: 'milk'}),
        quantity: z.number().min(1).max(999).optional().openapi({example: 2}),
        price: z.number().min(0).max(999999).openapi({example: 40}),
        date: z.iso.date({ error: 'Дата має бути у форматі РРРР-ММ-ДД' }).optional().default(todayString),
        splitBetween: z
            .array(z.string(), { error: 'Оберіть учасників' })
            .min(1, 'Оберіть хоча б одного учасника')
            .refine((ids) => new Set(ids).size === ids.length, {
                error: 'Учасники не мають повторюватися',
            })
            .optional(),
    })
    .openapi('CreateItemRequest');

export const itemUpdateSchema = itemCreateSchema
    .partial()
    .openapi('UpdateItemRequest');

export const itemResponseSchema = z
    .object({
        id: z.uuid().openapi({example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b'}),
        roomId: z.uuid().openapi({example: '14e07f1d-0fb0-43bc-bc87-4e538ba59591'}),
        name: z.string().openapi({example: 'milk'}),
        quantity: z.number().openapi({example: 2}),
        price: z.number().openapi({example: 40}),
        addedById: z.string().openapi({example: 'temp-user'}),
        createdAt: z.iso.datetime().openapi({example: '2026-09-26T07:34:07.777Z'}),
    })
    .openapi('Item');

export const itemParamsSchema = roomParamsSchema.extend({
    itemId: z.uuid().openapi({
        param: {description: 'Item ID'},
        example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b',
    }),
});

export type ItemResponse = z.infer<typeof itemResponseSchema>;

export type ItemCreateInput = z.infer<typeof itemCreateSchema>;
