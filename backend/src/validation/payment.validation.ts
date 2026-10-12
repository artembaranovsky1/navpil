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

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
