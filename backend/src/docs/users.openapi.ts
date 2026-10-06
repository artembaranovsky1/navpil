import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import * as z from "zod";
import {
    userCreateSchema,
    userParamsSchema,
    userResponseSchema,
    userUpdateSchema,
} from "../validation/user.validation.js";
import {jsonContent, notFoundResponse, validationFailedResponse} from "./common.openapi.js";

export const usersRegistry = new OpenAPIRegistry();

const TAG = 'Users';

usersRegistry.registerPath({
    method: 'get',
    path: '/users',
    operationId: 'getUsers',
    summary: 'List users',
    tags: [TAG],
    responses: {
        200: {description: 'List of users', ...jsonContent(z.array(userResponseSchema))},
    },
});

usersRegistry.registerPath({
    method: 'get',
    path: '/users/{userId}',
    operationId: 'getUser',
    summary: 'Get a user by ID',
    tags: [TAG],
    request: {params: userParamsSchema},
    responses: {
        200: {description: 'User found', ...jsonContent(userResponseSchema)},
        404: notFoundResponse('User not found'),
    },
});

usersRegistry.registerPath({
    method: 'post',
    path: '/users',
    operationId: 'createUser',
    summary: 'Create a user',
    tags: [TAG],
    request: {body: jsonContent(userCreateSchema)},
    responses: {
        201: {description: 'User created', ...jsonContent(userResponseSchema)},
        422: validationFailedResponse,
    },
});

usersRegistry.registerPath({
    method: 'patch',
    path: '/users/{userId}',
    operationId: 'updateUser',
    summary: 'Update a user',
    tags: [TAG],
    request: {
        params: userParamsSchema,
        body: jsonContent(userUpdateSchema),
    },
    responses: {
        200: {description: 'User updated', ...jsonContent(userResponseSchema)},
        404: notFoundResponse('User not found'),
        422: validationFailedResponse,
    },
});

usersRegistry.registerPath({
    method: 'delete',
    path: '/users/{userId}',
    operationId: 'deleteUser',
    summary: 'Delete a user',
    tags: [TAG],
    request: {params: userParamsSchema},
    responses: {
        204: {description: 'User deleted'},
        404: notFoundResponse('User not found'),
    },
});
