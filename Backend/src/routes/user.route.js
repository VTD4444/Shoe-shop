import { Router } from "express";
import userController from "../controllers/user.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
const router = Router();

router.get("/", (req, res) => {
    res.send("User route");
});


// áp dụng authMiddleware xác thực cho các route bên dưới
router.use(AuthMiddleware)
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put("/change-password", userController.changePassword);
export default router;
