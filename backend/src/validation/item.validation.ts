import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';
import {roomParamsSchema} from "./room.validation.js";
import {ITEM_CATEGORIES, ItemCategory} from "../types.js";

const todayString = (): string => new Date().toISOString().slice(0, 10);

extendZodWithOpenApi(z);

export const itemCreateSchema = z
    .object({
        name: z.string().min(3).max(20).openapi({example: 'milk'}),
        description: z.string().trim().max(200, 'Опис занадто довгий').optional(),
        amount: z.number({ error: 'Сума має бути числом' })
            .positive('Сума має бути більшою за 0')
            .max(1_000_000, 'Занадто велика сума'),
        category: z.enum(ITEM_CATEGORIES),
        date: z.iso.date({ error: 'Дата має бути у форматі РРРР-ММ-ДД' }).optional().default(todayString),
        paidById: z.string().optional(),
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
        amount: z.number({ error: 'Сума має бути числом' })
            .positive('Сума має бути більшою за 0')
            .max(1_000_000, 'Занадто велика сума'),
        category: z.enum(ITEM_CATEGORIES),
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
