import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const userCreateSchema = z
    .object({
        name: z.string().trim().min(3).max(20).openapi({example: 'John Doe'}),
        email: z.email().openapi({example: 'johndoe@example.com'}),
        password: z.string().min(8).max(72).openapi({example: 'secret123'}),
    })
    .openapi('CreateUserRequest');

export const userUpdateSchema = userCreateSchema
    .pick({name: true})
    .openapi('UpdateUserRequest');

export const userResponseSchema = z
    .object({
        id: z.uuid().openapi({example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b'}),
        email: z.email().openapi({example: 'johndoe@example.com'}),
        name: z.string().openapi({example: 'John Doe'}),
        createdAt: z.iso.datetime().openapi({example: '2026-09-26T07:34:07.777Z'}),
    })
    .openapi('User');

export const userParamsSchema = z.object({
    userId: z.uuid().openapi({
        param: {description: 'User ID'},
        example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b',
    }),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
