import express from 'express';
import { createRequest, getMyRequests } from '../controllers/requestController.js';
import { protect, hospital } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, hospital, createRequest);
router.route('/myrequests').get(protect, hospital, getMyRequests);

export default router;
