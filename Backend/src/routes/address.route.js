import express from 'express';
import addressController from '../controllers/address.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', addressController.getAddresses);
router.put("/:id",addressController.updateAddress);
router.post('/', addressController.addAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;