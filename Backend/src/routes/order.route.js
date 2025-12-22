import express from "express";
import orderController from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware.js";

const router = express.Router();

// router.get("/all", adminAuthMiddleware, orderController.getAllOrders);
// router.put("/status", adminAuthMiddleware, orderController.changeOrderStatus);
// router.get("/detail/:id", adminAuthMiddleware, orderController.getOrderDetail);
router.get("/all", orderController.getAllOrders);
router.put("/status", orderController.changeOrderStatus);
router.get("/detail/:id", orderController.getOrderDetail);

router.use(authMiddleware);
router.get("/", orderController.getOrderHistory);
router.post("/preview", orderController.previewOrder);
router.post("/", orderController.createOrder);
router.get("/:id", orderController.getOrderDetail);
router.put("/:id/pay", orderController.markOrderAsPaid);
router.put("/:id/cancel", orderController.cancelOrder);

export default router;
