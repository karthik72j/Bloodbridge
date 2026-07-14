import express from 'express';
import { getInventoryStatus } from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getInventoryStatus);

export default router;
