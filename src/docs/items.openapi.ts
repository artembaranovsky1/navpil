import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import * as z from "zod";
import {
    itemCreateSchema,
    itemParamsSchema,
    itemResponseSchema,
    itemUpdateSchema,
} from "../validation/item.validation.js";
import {roomParamsSchema} from "../validation/room.validation.js";
import {jsonContent, notFoundResponse, validationFailedResponse} from "./common.openapi.js";

export const itemsRegistry = new OpenAPIRegistry();

const TAG = 'Items';

itemsRegistry.registerPath({
    method: 'get',
    path: '/rooms/{roomId}/items',
    operationId: 'getItems',
    summary: 'List items in a room',
    tags: [TAG],
    request: {params: roomParamsSchema},
    responses: {
        200: {description: 'List of items', ...jsonContent(z.array(itemResponseSchema))},
        404: notFoundResponse('Room not found'),
    },
});

itemsRegistry.registerPath({
    method: 'get',
    path: '/rooms/{roomId}/items/{itemId}',
    operationId: 'getItem',
    summary: 'Get an item by ID',
    tags: [TAG],
    request: {params: itemParamsSchema},
    responses: {
        200: {description: 'Item found', ...jsonContent(itemResponseSchema)},
        404: notFoundResponse('Room or item not found'),
    },
});

itemsRegistry.registerPath({
    method: 'post',
    path: '/rooms/{roomId}/items',
    operationId: 'createItem',
    summary: 'Add an item to a room',
    tags: [TAG],
    request: {
        params: roomParamsSchema,
        body: jsonContent(itemCreateSchema),
    },
    responses: {
        201: {description: 'Item created', ...jsonContent(itemResponseSchema)},
        404: notFoundResponse('Room not found'),
        422: validationFailedResponse,
    },
});

itemsRegistry.registerPath({
    method: 'patch',
    path: '/rooms/{roomId}/items/{itemId}',
    operationId: 'updateItem',
    summary: 'Update an item',
    tags: [TAG],
    request: {
        params: itemParamsSchema,
        body: jsonContent(itemUpdateSchema),
    },
    responses: {
        200: {description: 'Item updated', ...jsonContent(itemResponseSchema)},
        404: notFoundResponse('Room or item not found'),
        422: validationFailedResponse,
    },
});

itemsRegistry.registerPath({
    method: 'delete',
    path: '/rooms/{roomId}/items/{itemId}',
    operationId: 'deleteItem',
    summary: 'Delete an item',
    tags: [TAG],
    request: {params: itemParamsSchema},
    responses: {
        204: {description: 'Item deleted'},
        404: notFoundResponse('Room or item not found'),
    },
});
