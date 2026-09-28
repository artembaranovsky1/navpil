import * as z from "zod";
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const errorResponseSchema = z
    .object({
        error: z.string().openapi({example: 'Not found'}),
    })
    .openapi('ErrorResponse');

export const validationErrorResponseSchema = z
    .object({
        error: z.string().openapi({example: 'Validation failed'}),
        details: z
            .record(z.string(), z.array(z.string()))
            .openapi({example: {name: ['Too small: expected string to have >=3 characters']}}),
    })
    .openapi('ValidationErrorResponse');

export const jsonContent = <T extends z.ZodType>(schema: T) => ({
    content: {'application/json': {schema}},
});

export const notFoundResponse = (description: string) => ({
    description,
    ...jsonContent(errorResponseSchema),
});

export const validationFailedResponse = {
    description: 'Validation failed',
    ...jsonContent(validationErrorResponseSchema),
};
