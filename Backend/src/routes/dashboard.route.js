import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(verifyToken);
router.use(isAdmin);
router.get('/stats', dashboardController.getStats);
router.get('/top-products', dashboardController.getTopSellingProducts);
router.get('/revenue-chart', dashboardController.getRevenueChart);

export default router;