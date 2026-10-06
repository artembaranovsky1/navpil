import 'dotenv/config';
import express, {type Request, type Response} from 'express';
import roomRoutes from './routes/room.routes.js';
import itemRoutes from './routes/item.routes.js';
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import swaggerUi from "swagger-ui-express";
import {openApiDocument} from "./docs/index.js";
import {verifyToken} from "./auth/middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200)
    res.send('Привіт, сервер працює на Express + TypeScript!');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/health', (req: Request, res: Response) => {
    res.json('ok');
})

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/rooms', verifyToken, itemRoutes);
app.use('/users', verifyToken, userRoutes);

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});