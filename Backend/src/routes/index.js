import { Router } from "express";
import user from "./user.route.js";
import auth from "./auth.routes.js";
import address from "./address.route.js";
import productRoutes from './product.route.js';
import cartRoutes from './cart.route.js';
const router = Router();
import orderRoutes from './order.route.js';



router.use("/auth", auth);
router.use("/users", user);
router.use("/addresses", address);
router.use("/products", productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
export default router;
