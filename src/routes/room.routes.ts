import {Router} from "express";
import * as roomController from '../controllers/room.controller.js';

const router = Router()

router.get('/', roomController.getRooms);
router.get('/:roomId', roomController.getRoom);
router.post('/', roomController.createRoom);
router.patch('/:roomId', roomController.updateRoom);
router.delete('/:roomId', roomController.deleteRoom);

export default router;