import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import {loginResponseSchema, loginSchema, registerSchema} from "../validation/auth.validation.js";
import {userResponseSchema} from "../validation/user.validation.js";
import {errorResponse, jsonContent, validationFailedResponse} from "./common.openapi.js";

export const authRegistry = new OpenAPIRegistry();

const TAG = 'Auth';

authRegistry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Токен з POST /auth/login, живе 7 днів',
});

authRegistry.registerPath({
    method: 'post',
    path: '/auth/register',
    operationId: 'register',
    summary: 'Register a new user',
    tags: [TAG],
    security: [],
    request: {body: jsonContent(registerSchema)},
    responses: {
        201: {description: 'User registered', ...jsonContent(userResponseSchema)},
        409: errorResponse('Email is already registered'),
        422: validationFailedResponse,
    },
});

authRegistry.registerPath({
    method: 'post',
    path: '/auth/login',
    operationId: 'login',
    summary: 'Log in and get a JWT',
    tags: [TAG],
    security: [],
    request: {body: jsonContent(loginSchema)},
    responses: {
        200: {description: 'Logged in', ...jsonContent(loginResponseSchema)},
        401: errorResponse('Invalid email or password'),
        422: validationFailedResponse,
    },
});
