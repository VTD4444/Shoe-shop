import express from 'express';
import orderController from '../controllers/order.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', orderController.getOrderHistory);
router.post('/preview', orderController.previewOrder);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderDetail);
router.put('/:id/pay', orderController.markOrderAsPaid);
router.put('/:id/cancel', orderController.cancelOrder);

export default router;