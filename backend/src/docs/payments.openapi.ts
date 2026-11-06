import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import * as z from "zod";
import {paymentCreateSchema, paymentResponseSchema} from "../validation/payment.validation.js";
import {roomParamsSchema} from "../validation/room.validation.js";
import {errorResponse, jsonContent, notFoundResponse, validationFailedResponse} from "./common.openapi.js";

export const paymentsRegistry = new OpenAPIRegistry();

const TAG = 'Payments';

paymentsRegistry.registerPath({
    method: 'get',
    path: '/rooms/{roomId}/payments',
    operationId: 'getPayments',
    summary: 'List payments (settlements) in a room',
    tags: [TAG],
    request: {params: roomParamsSchema},
    responses: {
        200: {description: 'List of payments', ...jsonContent(z.array(paymentResponseSchema))},
        403: errorResponse('You are not a member of this trip'),
        404: notFoundResponse('Room not found'),
    },
});

paymentsRegistry.registerPath({
    method: 'post',
    path: '/rooms/{roomId}/payments',
    operationId: 'createPayment',
    summary: 'Record a payment between two members',
    tags: [TAG],
    request: {
        params: roomParamsSchema,
        body: jsonContent(paymentCreateSchema),
    },
    responses: {
        201: {description: 'Payment created', ...jsonContent(paymentResponseSchema)},
        403: errorResponse('You are not a member of this trip'),
        404: notFoundResponse('Room not found'),
        422: validationFailedResponse,
    },
});
