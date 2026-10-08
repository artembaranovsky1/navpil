import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const dataField = z.iso
    .date({error: 'Дата має бути у форматі РРРР-ММ-ДД'})
    .optional()

const datesInOrder = (data: { startDate?: string, endDate?: string }) => {
    if (!data.startDate || !data.endDate) {
        return true;
    }

    return data.endDate >= data.startDate;
}

export const roomCreateSchema = z
    .object({
        name: z.string().trim().min(1, 'Вкажіть назву').max(60, 'Назва — до 60 символів'),
        description: z.string().trim().max(500, 'Опис — до 500 символів').optional(),
        startDate: dataField,
        endDate: dataField,
    }).refine(datesInOrder, {
        error: 'Кінець не може бути раніше початку',
        path: ['endDate'],
    });

export const roomUpdateSchema = z
    .object({
        name: z.string().trim().min(1, 'Вкажіть назву').max(60, 'Назва — до 60 символів'),
        description: z.string().trim().max(500, 'Опис — до 500 символів').optional(),
        startDate: dataField,
        endDate: dataField,
    }).refine(datesInOrder, {
        error: 'Кінець не може бути раніше початку',
        path: ['endDate'],
    });

export const roomResponseSchema = z
    .object({
        id: z.uuid().openapi({example: '14e07f1d-0fb0-43bc-bc87-4e538ba59591'}),
        name: z.string().openapi({example: 'Slavutych'}),
        description: z.string().optional().openapi({example: 'Shopping list for the weekend trip'}),
        startDate: z.iso.date().optional().openapi({example: '2026-10-10'}),
        endDate: z.iso.date().optional().openapi({example: '2026-10-13'}),
        createdAt: z.iso.datetime().openapi({example: '2026-09-26T07:34:07.777Z'}),
    })
    .openapi('Room');

export const roomParamsSchema = z.object({
    roomId: z.uuid().openapi({
        param: {description: 'Room ID'},
        example: '14e07f1d-0fb0-43bc-bc87-4e538ba59591',
    }),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
