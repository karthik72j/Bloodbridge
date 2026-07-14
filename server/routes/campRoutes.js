import express from 'express';
import { createCamp, getCamps } from '../controllers/campController.js';
import { protect, hospital } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getCamps).post(protect, hospital, createCamp);

export default router;
