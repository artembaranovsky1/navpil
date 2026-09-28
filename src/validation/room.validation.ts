import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const roomCreateSchema = z
    .object({
        name: z.string().trim().min(3).max(20).openapi({example: 'Slavutych'}),
        description: z.string().max(200).optional().openapi({example: 'Shopping list for the weekend trip'}),
    })
    .openapi('CreateRoomRequest');

export const roomUpdateSchema = roomCreateSchema
    .partial()
    .openapi('UpdateRoomRequest');

export const roomResponseSchema = z
    .object({
        id: z.uuid().openapi({example: '14e07f1d-0fb0-43bc-bc87-4e538ba59591'}),
        name: z.string().openapi({example: 'Slavutych'}),
        description: z.string().optional().openapi({example: 'Shopping list for the weekend trip'}),
        createdAt: z.iso.datetime().openapi({example: '2026-09-26T07:34:07.777Z'}),
    })
    .openapi('Room');

export const roomParamsSchema = z.object({
    roomId: z.uuid().openapi({
        param: {description: 'Room ID'},
        example: '14e07f1d-0fb0-43bc-bc87-4e538ba59591',
    }),
});

export type RoomResponse = z.infer<typeof roomResponseSchema>;
