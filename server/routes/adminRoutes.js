import express from 'express';
import { 
  getUsers,
  deleteUser,
  getAllRequests, 
  updateRequestStatus, 
  recordDonation, 
  getDonationHistory, 
  getAnalytics 
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);

router.route('/requests').get(protect, admin, getAllRequests);
router.route('/requests/:id/status').put(protect, admin, updateRequestStatus);
router.route('/donations').post(protect, admin, recordDonation).get(protect, admin, getDonationHistory);
router.route('/analytics').get(protect, admin, getAnalytics);

export default router;
