import express from 'express';
import cartController from '../controllers/cart.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/:id', cartController.updateCartItem);
router.delete("/:id", cartController.removeCartItem);
export default router;