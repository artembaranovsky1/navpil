import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const dataField = z.iso
    .date({error: 'Дата має бути у форматі РРРР-ММ-ДД'})
    .optional()

const datesInOrder = (data: { startDate?: string | null, endDate?: string | null }) => {
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
        // null — прибрати дату
        startDate: dataField.nullable(),
        endDate: dataField.nullable(),
    }).refine(datesInOrder, {
        error: 'Кінець не може бути раніше початку',
        path: ['endDate'],
    });

export const joinRoomSchema = z
    .object({
        code: z
            .string()
            .trim()
            .toUpperCase()
            .length(6, 'Код має містити 6 символів')
            .openapi({example: 'KRP482'}),
    })
    .openapi('JoinRoomRequest');

const roomMemberSchema = z
    .object({
        id: z.uuid().openapi({example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b'}),
        name: z.string().openapi({example: 'John Doe'}),
        email: z.email().openapi({example: 'johndoe@example.com'}),
        role: z.enum(['owner', 'member']),
        joinedAt: z.iso.datetime().openapi({example: '2026-09-26T07:34:07.777Z'}),
    })
    .openapi('RoomMember');

export const roomResponseSchema = z
    .object({
        id: z.uuid().openapi({example: '14e07f1d-0fb0-43bc-bc87-4e538ba59591'}),
        name: z.string().openapi({example: 'Slavutych'}),
        description: z.string().optional().openapi({example: 'Shopping list for the weekend trip'}),
        startDate: z.iso.date().optional().openapi({example: '2026-10-10'}),
        endDate: z.iso.date().optional().openapi({example: '2026-10-13'}),
        inviteCode: z.string().openapi({example: 'KRP482'}),
        createdAt: z.iso.datetime().openapi({example: '2026-09-26T07:34:07.777Z'}),
        members: z.array(roomMemberSchema),
        status: z.enum(['active', 'upcoming', 'past']),
    })
    .openapi('Room');

export const roomsGroupedResponseSchema = z
    .object({
        active: z.array(roomResponseSchema),
        upcoming: z.array(roomResponseSchema),
        past: z.array(roomResponseSchema),
    })
    .openapi('RoomsGrouped');

const roomSummarySchema = z
    .object({
        total: z.number().openapi({example: 20470}),
        myBalance: z.number().openapi({example: 2800}),
    })
    .openapi('RoomSummary');

export const roomsSummaryResponseSchema = z
    .object({
        myBalance: z.number().openapi({example: 2800, description: 'Скільки ще мають повернути користувачу (+) чи має віддати він (−)'}),
        totalSpent: z.number().openapi({example: 20470}),
        tripsThisYear: z.number().int().openapi({example: 3}),
        trips: z.record(z.uuid(), roomSummarySchema),
    })
    .openapi('RoomsSummary');

export const roomParamsSchema = z.object({
    roomId: z.uuid().openapi({
        param: {description: 'Room ID'},
        example: '14e07f1d-0fb0-43bc-bc87-4e538ba59591',
    }),
});

export const roomMemberParamsSchema = roomParamsSchema.extend({
    userId: z.uuid().openapi({
        param: {description: 'User ID'},
        example: '9b907f1d-0fb0-43bc-bc87-4e538ba5958b',
    }),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
