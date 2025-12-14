import express from 'express';
import productController from '../controllers/product.controller.js';

const router = express.Router();
router.get("/filters",productController.getFilterMetadata)

router.get("/trending",productController.getTrendingProducts)
router.post('/search', productController.searchProducts);
router.get('/:id', productController.getProductDetail);
export default router;