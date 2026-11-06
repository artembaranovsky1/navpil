import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import * as z from "zod";
import {
    joinRoomSchema,
    roomCreateSchema,
    roomMemberParamsSchema,
    roomParamsSchema,
    roomResponseSchema,
    roomsGroupedResponseSchema,
    roomsSummaryResponseSchema,
    roomUpdateSchema,
} from "../validation/room.validation.js";
import {errorResponse, jsonContent, notFoundResponse, validationFailedResponse} from "./common.openapi.js";

export const roomsRegistry = new OpenAPIRegistry();

const TAG = 'Rooms';

roomsRegistry.registerPath({
    method: 'get',
    path: '/rooms',
    operationId: 'getRooms',
    summary: 'List rooms of the current user, grouped by status',
    tags: [TAG],
    responses: {
        200: {description: 'Rooms grouped by status', ...jsonContent(roomsGroupedResponseSchema)},
    },
});

roomsRegistry.registerPath({
    method: 'get',
    path: '/rooms/summary',
    operationId: 'getRoomsSummary',
    summary: 'Totals and balance of the current user across all their rooms',
    tags: [TAG],
    responses: {
        200: {description: 'Summary', ...jsonContent(roomsSummaryResponseSchema)},
    },
});

roomsRegistry.registerPath({
    method: 'get',
    path: '/rooms/{roomId}',
    operationId: 'getRoom',
    summary: 'Get a room by ID',
    tags: [TAG],
    request: {params: roomParamsSchema},
    responses: {
        200: {description: 'Room found', ...jsonContent(roomResponseSchema)},
        404: notFoundResponse('Room not found'),
    },
});

roomsRegistry.registerPath({
    method: 'post',
    path: '/rooms',
    operationId: 'createRoom',
    summary: 'Create a room',
    tags: [TAG],
    request: {body: jsonContent(roomCreateSchema)},
    responses: {
        201: {description: 'Room created', ...jsonContent(roomResponseSchema)},
        422: validationFailedResponse,
    },
});

roomsRegistry.registerPath({
    method: 'post',
    path: '/rooms/join',
    operationId: 'joinRoom',
    summary: 'Join a room by invite code',
    tags: [TAG],
    request: {body: jsonContent(joinRoomSchema)},
    responses: {
        200: {description: 'Joined (or already a member)', ...jsonContent(roomResponseSchema)},
        404: notFoundResponse('Invalid invite code'),
        422: validationFailedResponse,
    },
});

roomsRegistry.registerPath({
    method: 'patch',
    path: '/rooms/{roomId}',
    operationId: 'updateRoom',
    summary: 'Update a room',
    tags: [TAG],
    request: {
        params: roomParamsSchema,
        body: jsonContent(roomUpdateSchema),
    },
    responses: {
        200: {description: 'Room updated', ...jsonContent(roomResponseSchema)},
        404: notFoundResponse('Room not found'),
        422: validationFailedResponse,
    },
});

roomsRegistry.registerPath({
    method: 'delete',
    path: '/rooms/{roomId}',
    operationId: 'deleteRoom',
    summary: 'Delete a room',
    tags: [TAG],
    request: {params: roomParamsSchema},
    responses: {
        204: {description: 'Room deleted'},
        404: notFoundResponse('Room not found'),
    },
});

roomsRegistry.registerPath({
    method: 'delete',
    path: '/rooms/{roomId}/members/{userId}',
    operationId: 'removeMember',
    summary: 'Remove a member from a room (owner only)',
    tags: [TAG],
    request: {params: roomMemberParamsSchema},
    responses: {
        204: {description: 'Member removed'},
        403: errorResponse('Only the owner can remove members'),
        404: notFoundResponse('Room or member not found'),
        409: errorResponse('Member has expenses or payments in this trip'),
        422: errorResponse('Owner cannot remove themselves'),
    },
});
