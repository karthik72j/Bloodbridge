import express from 'express';
import { 
  getDonorProfile, 
  getDonationHistory, 
  bookCamp, 
  toggleAvailability, 
  searchDonors 
} from '../controllers/donorController.js';
import { protect, donor, hospital } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile').get(protect, donor, getDonorProfile);
router.route('/history').get(protect, donor, getDonationHistory);
router.route('/book-camp').post(protect, donor, bookCamp);
router.route('/toggle-availability').put(protect, donor, toggleAvailability);
router.route('/search').get(protect, hospital, searchDonors);

export default router;
