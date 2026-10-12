import {Router} from "express";
import * as paymentController from '../controllers/payment.controller.js';

const router = Router()

router.get('/:roomId/payments', paymentController.getPayments);
router.post('/:roomId/payments', paymentController.createPayment);

export default router;
