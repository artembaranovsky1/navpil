import {Router} from "express";
import * as itemController from '../controllers/item.controller.js';

const router = Router()

router.get('/:roomId/items', itemController.getItems);
router.get('/:roomId/items/:itemId', itemController.getItem);
router.post('/:roomId/items', itemController.createItem);
router.patch('/:roomId/items/:itemId', itemController.updateItem);
router.delete('/:roomId/items/:itemId', itemController.deleteItem);

export default router;