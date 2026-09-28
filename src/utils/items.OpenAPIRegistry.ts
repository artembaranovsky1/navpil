import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import * as z from "zod";
import {itemResponseSchema} from "../validation/item.validation.js";

export const itemsRegistry = new OpenAPIRegistry();


itemsRegistry.registerPath({
    method: 'get',
    path: '/rooms/{roomId}/items',
    summary: 'Get items',
    tags: ['Item'],
    responses: {
        200: {
            description: 'List of items',
            content: {'application/json': {schema: z.array(itemResponseSchema)}},
        },
    },
});

itemsRegistry.registerPath({
    method: 'get',
    path: '/rooms/{roomId}/items/{itemId}',
    summary: 'Get item',
    tags: ['Item'],
    request: {
        params: itemResponseSchema,
    },
    responses: {
        200: {
            description: 'Item found',
            content: {'application/json': {schema: itemResponseSchema}},
        },
        404: {description: 'Room not found'},
    },
});

itemsRegistry.registerPath({
    method: 'post',
    path: '/rooms/{roomId}/items',
    summary: 'Create item',
    tags: ['Item'],
    request: {
        body: {content: {'application/json': {schema: itemResponseSchema}},},
    },
    responses: {
        201: {
            description: 'Item created',
            content: {'application/json': {schema: itemResponseSchema}},
        },
        404: {description: 'Room not found'},
        422: {description: 'Validation failed'},
    },
});

itemsRegistry.registerPath({
    method: 'patch',
    path: '/rooms/{roomId}/items/{itemId}',
    summary: 'Item user',
    tags: ['Item'],
    request: {
        params: itemResponseSchema,
        body: {content: {'application/json': {schema: itemResponseSchema}}},
    },
    responses: {
        200: {
            description: 'Item updated',
            content: {'application/json': {schema: itemResponseSchema}},
        },
        404: {description: 'Item not found'},
        422: {description: 'Validation failed'},
    },
});

itemsRegistry.registerPath({
    method: 'delete',
    path: '/rooms/{roomId}/items/{itemId}',
    summary: 'Delete item',
    tags: ['Item'],
    request: {
        params: itemResponseSchema,
    },
    responses: {
        204: {description: 'Item deleted'},
        404: {description: 'Item not found'},
    },
});
