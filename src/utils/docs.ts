import {OpenApiGeneratorV3} from '@asteasolutions/zod-to-openapi';
import {usersRegistry} from "./users.OpenAPIRegistry.js";
import {itemsRegistry} from "./items.OpenAPIRegistry.js";
import {roomsRegistry} from "./rooms.OpenAPIRegistry.js";

function getOpenApiDocumentation() {
    const generator = new OpenApiGeneratorV3([
        ...usersRegistry.definitions,
        ...itemsRegistry.definitions,
        ...roomsRegistry.definitions,
    ]);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Мій API з Zod та Swagger',
            description: 'Приклад інтеграції zod-to-openapi',
        },
        servers: [{url: 'http://localhost:3000'}],
    });
}

export const openApiDocument = getOpenApiDocumentation();