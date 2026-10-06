import {Router} from "express";
import * as roomController from '../controllers/room.controller.js';
import {verifyToken} from "../auth/middleware.js";

const router = Router()

router.get('/', verifyToken,roomController.getRooms);
router.get('/:roomId', verifyToken, roomController.getRoom);
router.post('/', verifyToken, roomController.createRoom);
router.patch('/:roomId', verifyToken, roomController.updateRoom);
router.delete('/:roomId', verifyToken, roomController.deleteRoom);

export default router;