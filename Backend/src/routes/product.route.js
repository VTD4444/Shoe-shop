import express from 'express';
import productController from '../controllers/product.controller.js';
import reviewController from '../controllers/review.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.get("/filters",productController.getFilterMetadata)
router.get("/trending",productController.getTrendingProducts)
router.post('/inventory', verifyToken, isAdmin, productController.getInventory);


router.post('/search', productController.searchProducts);
router.get('/:id/reviews', reviewController.getProductReviews);
router.get('/:id', productController.getProductDetail);
router.put('/:id', verifyToken, isAdmin, productController.updateProductMaster);
router.post(
  '/:id/reviews',
  authMiddleware,
  reviewController.submitReview
);
export default router;