import express from "express";
import {
  createVoucher,
  getAllVouchers,
  updateVoucher,
  deleteVoucher,
} from "../controllers/voucher.controller.js";
import adminAuthMiddleware from "../middlewares/adminAuth.middleware.js";

const router = express.Router();

router.post("/", adminAuthMiddleware, createVoucher);
router.get("/", adminAuthMiddleware, getAllVouchers);
router.put("/:id", adminAuthMiddleware, updateVoucher);
router.delete("/:id", adminAuthMiddleware, deleteVoucher);

export default router;
