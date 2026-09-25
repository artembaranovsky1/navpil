import express, {type Request, type Response} from 'express';
import roomRoutes from './routes/room.routes.js';
import itemRoutes from './routes/item.routes.js';
import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200)
    res.send('Привіт, сервер працює на Express + TypeScript!');
});


app.get('/health', (req: Request, res: Response) => {
    res.json('ok');
})

app.use('/rooms', roomRoutes);
app.use('/rooms', itemRoutes);
app.use('/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});