import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import * as z from "zod";
import {roomCreateSchema, roomResponseSchema, roomUpdateSchema} from "../validation/room.validation.js";

export const roomsRegistry = new OpenAPIRegistry();

roomsRegistry.registerPath({
    method: 'get',
    path: '/rooms',
    summary: 'Get rooms',
    tags: ['Rooms'],
    responses: {
        200: {
            description: 'List of rooms',
            content: {'application/json': {schema: z.array(roomResponseSchema)}},
        },
    },
});

roomsRegistry.registerPath({
    method: 'get',
    path: 'rooms/{roomId}',
    summary: 'Get room',
    tags: ['Rooms'],
    request: {
        params: roomResponseSchema,
    },
    responses: {
        200: {
            description: 'Room found',
            content: {'application/json': {schema: roomResponseSchema}},
        },
        404: {description: 'Room not found'},
    },
});

roomsRegistry.registerPath({
    method: 'post',
    path: '/rooms',
    summary: 'Create room',
    tags: ['Rooms'],
    request: {
        body: {content: {'application/json': {schema: roomCreateSchema}}},
    },
    responses: {
        201: {
            description: 'Room created',
            content: {'application/json': {schema: roomResponseSchema}},
        },
        422: {description: 'Validation failed'},
    },
});

roomsRegistry.registerPath({
    method: 'patch',
    path: 'rooms/{roomId}',
    summary: 'Update room',
    tags: ['Rooms'],
    request: {
        params: roomResponseSchema,
        body: {content: {'application/json': {schema: roomUpdateSchema}}},
    },
    responses: {
        200: {
            description: 'Room updated',
            content: {'application/json': {schema: roomResponseSchema}},
        },
        404: {description: 'Room not found'},
        422: {description: 'Validation failed'},
    },
});

roomsRegistry.registerPath({
    method: 'delete',
    path: 'rooms/{roomId}',
    summary: 'Delete room',
    tags: ['Rooms'],
    request: {
        params: roomResponseSchema,
    },
    responses: {
        204: {description: 'Room deleted'},
        404: {description: 'Room not found'},
    },
});