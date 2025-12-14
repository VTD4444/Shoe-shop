import { Router } from "express";
import user from "./user.route.js";
import auth from "./auth.routes.js";
import address from "./address.route.js";
const router = Router();

// router.use("/users", user);
router.use("/auth", auth);
router.use("/users", user);
router.use("/addresses", address);
export default router;
