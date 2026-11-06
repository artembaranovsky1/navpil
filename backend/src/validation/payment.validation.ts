import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const paymentCreateSchema = z
    .object({
        fromId: z.string().min(1),
        toId: z.string().min(1),
        amount: z.number({ error: 'Сума має бути числом' })
            .positive('Сума має бути більшою за 0')
            .max(1_000_000, 'Занадто велика сума'),
    })
    .refine((data) => data.fromId !== data.toId, {
        error: 'Не можна переказати самому собі',
        path: ['toId'],
    })
    .openapi('CreatePaymentRequest');

export const paymentResponseSchema = z
    .object({
        id: z.uuid().openapi({example: '5c1e7f1d-0fb0-43bc-bc87-4e538ba5958b'}),
        roomId: z.uuid().openapi({example: '14e07f1d-0fb0-43bc-bc87-4e538ba59591'}),
        fromId: z.uuid().openapi({example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b'}),
        toId: z.uuid().openapi({example: '2a907f1d-0fb0-43bc-bc87-4e538ba5958c'}),
        amount: z.number().openapi({example: 1940}),
        createdById: z.uuid().openapi({example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b'}),
        createdAt: z.iso.datetime().openapi({example: '2026-09-26T07:34:07.777Z'}),
    })
    .openapi('Payment');

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
