import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import * as z from "zod";
import {
    roomCreateSchema,
    roomParamsSchema,
    roomResponseSchema,
    roomUpdateSchema,
} from "../validation/room.validation.js";
import {jsonContent, notFoundResponse, validationFailedResponse} from "./common.openapi.js";

export const roomsRegistry = new OpenAPIRegistry();

const TAG = 'Rooms';

roomsRegistry.registerPath({
    method: 'get',
    path: '/rooms',
    operationId: 'getRooms',
    summary: 'List rooms',
    tags: [TAG],
    responses: {
        200: {description: 'List of rooms', ...jsonContent(z.array(roomResponseSchema))},
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
