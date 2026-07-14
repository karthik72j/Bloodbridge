import asyncHandler from 'express-async-handler';
import DonorProfile from '../models/DonorProfile.js';
import User from '../models/User.js';
import DonationHistory from '../models/DonationHistory.js';

// @desc    Get donor profile
// @route   GET /api/donor/profile
// @access  Private/Donor
const getDonorProfile = asyncHandler(async (req, res) => {
  const profile = await DonorProfile.findOne({ user: req.user._id }).populate('user', 'name email location phone');

  if (profile) {
    res.json(profile);
  } else {
    res.status(404);
    throw new Error('Donor profile not found');
  }
});

// @desc    Get past donation history for the donor
// @route   GET /api/donor/history
// @access  Private/Donor
const getDonationHistory = asyncHandler(async (req, res) => {
  const history = await DonationHistory.find({ donor: req.user._id }).sort({ donationDate: -1 });
  res.json(history);
});

// @desc    Book a camp slot
// @route   POST /api/donor/book-camp
// @access  Private/Donor
const bookCamp = asyncHandler(async (req, res) => {
  const { campName, date, location } = req.body;
  const profile = await DonorProfile.findOne({ user: req.user._id });
  
  if (profile) {
    profile.upcomingAppointment = { campName, date, location };
    await profile.save();
    res.json(profile.upcomingAppointment);
  } else {
    res.status(404);
    throw new Error('Donor profile not found');
  }
});

// @desc    Toggle availability status
// @route   PUT /api/donor/toggle-availability
// @access  Private/Donor
const toggleAvailability = asyncHandler(async (req, res) => {
  const profile = await DonorProfile.findOne({ user: req.user._id });

  if (profile) {
    profile.isAvailable = !profile.isAvailable;
    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } else {
    res.status(404);
    throw new Error('Donor profile not found');
  }
});

// @desc    Search donors (Hospital/Admin)
// @route   GET /api/donor/search
// @access  Private/(Hospital or Admin)
const searchDonors = asyncHandler(async (req, res) => {
  const { bloodGroup, location } = req.query;

  let query = { role: 'Donor' };
  
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  const users = await User.find(query).select('_id');
  const userIds = users.map(u => u._id);

  let profileQuery = {
    user: { $in: userIds },
    isAvailable: true,
  };

  if (bloodGroup) {
    profileQuery.bloodGroup = bloodGroup;
  }

  const donors = await DonorProfile.find(profileQuery).populate('user', 'name email location phone');

  // Filter out donors that are not eligible based on last donation date (virtual property)
  const eligibleDonors = donors.filter(d => d.eligibilityStatus === true);

  res.json(eligibleDonors);
});

export { getDonorProfile, getDonationHistory, bookCamp, toggleAvailability, searchDonors };
