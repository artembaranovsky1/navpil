import {Router} from "express";
import * as roomController from '../controllers/room.controller.js';
import {verifyToken} from "../auth/middleware.js";

const router = Router()

router.get('/', verifyToken,roomController.getRooms);
// має бути вище за '/:roomId', інакше "summary" сприйметься як id
router.get('/summary', verifyToken, roomController.getRoomsSummary);
router.get('/:roomId', verifyToken, roomController.getRoom);
router.post('/', verifyToken, roomController.createRoom);
router.post('/join', verifyToken, roomController.joinRoom);
router.patch('/:roomId', verifyToken, roomController.updateRoom);
router.delete('/:roomId', verifyToken, roomController.deleteRoom);
router.delete('/:roomId/members/:userId', verifyToken, roomController.removeMember);

export default router;