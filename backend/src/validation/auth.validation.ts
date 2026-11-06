import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const registerSchema = z
    .object({
        name: z.string().trim().min(3).max(20).openapi({example: 'John Doe'}),
        email: z.email().trim().toLowerCase().pipe(z.email()).openapi({example: 'johndoe@example.com'}),
        password: z.string().min(8).max(72).openapi({example: 'secret123'}),
    })
    .openapi('RegisterRequest')

export const loginSchema = z
    .object({
        email: z.email().trim().toLowerCase().pipe(z.email()).openapi({example: 'johndoe@example.com'}),
        password: z.string().openapi({example: 'secret123'}),
    })
    .openapi('LoginRequest')

export const loginResponseSchema = z
    .object({
        token: z.string().openapi({example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}),
    })
    .openapi('LoginResponse')

export type RegisterInput = z.infer<typeof registerSchema>;