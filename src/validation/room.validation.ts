import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';
import {userResponseSchema} from "./user.validation.js";

extendZodWithOpenApi(z);

export const roomCreateSchema = z.object({
    name: z.string().trim().max(20).min(3),
    description: z.string().max(200).optional(),
});

export const roomUpdateSchema = roomCreateSchema.pick({name: true, description: true});

export const roomResponseSchema = z
    .object({
        id: z.uuid().openapi({example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b'}),
        name: z.string().openapi({example: 'Slavutych'}),
        description: z.string().openapi('sdfsdf sdfsdfs sdfsdfsf sdf s sdfs'),
        createdAt: z.iso.datetime().openapi({example: '2026-09-26T07:34:07.777Z'}),
    })
    .openapi('Room');

export const roomParamsSchema = z.object({
    userId: z.uuid().openapi({example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b'}),
});


export type RoomResponse = z.infer<typeof roomResponseSchema>;