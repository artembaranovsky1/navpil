import {OpenApiGeneratorV3} from '@asteasolutions/zod-to-openapi';
import {usersRegistry} from "./users.openapi.js";
import {roomsRegistry} from "./rooms.openapi.js";
import {itemsRegistry} from "./items.openapi.js";

const PORT = process.env.PORT || 3000;

function generateOpenApiDocument() {
    const generator = new OpenApiGeneratorV3([
        ...usersRegistry.definitions,
        ...roomsRegistry.definitions,
        ...itemsRegistry.definitions,
    ]);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Shared Shopping API',
            description: 'API for managing users, rooms and the items inside them',
        },
        servers: [{url: `http://localhost:${PORT}`, description: 'Local'}],
        tags: [
            {name: 'Users', description: 'User management'},
            {name: 'Rooms', description: 'Rooms that group items'},
            {name: 'Items', description: 'Items inside a room'},
        ],
    });
}

export const openApiDocument = generateOpenApiDocument();
