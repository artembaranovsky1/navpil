import {Router} from "express";
import * as roomController from '../controllers/room.controller.js';

const router = Router()

router.get('/rooms', roomController.getRooms);
router.get('/rooms/:roomId', roomController.getRoom);
router.post('/rooms', roomController.createRoom);
router.patch('/rooms/:roomId', roomController.updateRoom);
router.delete('/rooms/:roomId', roomController.deleteRoom);

export default router;