import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const registerSchema = z
    .object({
        name: z.string().trim().min(3).max(20),
        email: z.email().trim().toLowerCase().pipe(z.email()),
        password: z.string().min(8).max(72),
    })

export const loginSchema = z
    .object({
        email: z.email().trim().toLowerCase().pipe(z.email()),
        password: z.string(),
    })

export type RegisterInput = z.infer<typeof registerSchema>;