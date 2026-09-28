import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import * as z from "zod";
import {
    userCreateSchema,
    userParamsSchema,
    userResponseSchema,
    userUpdateSchema,
} from "../validation/user.validation.js";

export const usersRegistry = new OpenAPIRegistry();

usersRegistry.registerPath({
    method: 'get',
    path: '/users',
    summary: 'Get users',
    tags: ['Users'],
    responses: {
        200: {
            description: 'List of users',
            content: {'application/json': {schema: z.array(userResponseSchema)}},
        },
    },
});

usersRegistry.registerPath({
    method: 'get',
    path: '/users/{userId}',
    summary: 'Get user',
    tags: ['Users'],
    request: {
        params: userParamsSchema,
    },
    responses: {
        200: {
            description: 'User found',
            content: {'application/json': {schema: userResponseSchema}},
        },
        404: {description: 'User not found'},
    },
});

usersRegistry.registerPath({
    method: 'post',
    path: '/users',
    summary: 'Create user',
    tags: ['Users'],
    request: {
        body: {content: {'application/json': {schema: userCreateSchema}}},
    },
    responses: {
        201: {
            description: 'User created',
            content: {'application/json': {schema: userResponseSchema}},
        },
        422: {description: 'Validation failed'},
    },
});

usersRegistry.registerPath({
    method: 'patch',
    path: '/users/{userId}',
    summary: 'Update user',
    tags: ['Users'],
    request: {
        params: userParamsSchema,
        body: {content: {'application/json': {schema: userUpdateSchema}}},
    },
    responses: {
        200: {
            description: 'User updated',
            content: {'application/json': {schema: userResponseSchema}},
        },
        404: {description: 'User not found'},
        422: {description: 'Validation failed'},
    },
});

usersRegistry.registerPath({
    method: 'delete',
    path: '/users/{userId}',
    summary: 'Delete user',
    tags: ['Users'],
    request: {
        params: userParamsSchema,
    },
    responses: {
        204: {description: 'User deleted'},
        404: {description: 'User not found'},
    },
});