import express from 'express';
import { sepayWebhook } from '../controllers/sepay.controller.js';

const router = express.Router();

router.all('/webhook', sepayWebhook);

export default router;
