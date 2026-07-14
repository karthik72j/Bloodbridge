import asyncHandler from 'express-async-handler';
import DonationCamp from '../models/DonationCamp.js';

// @desc    Create a new donation camp
// @route   POST /api/camps
// @access  Private/Hospital
const createCamp = asyncHandler(async (req, res) => {
  const { campName, date, location, description } = req.body;

  const camp = new DonationCamp({
    hospital: req.user._id,
    campName,
    date,
    location,
    description
  });

  const createdCamp = await camp.save();
  res.status(201).json(createdCamp);
});

// @desc    Get all active donation camps
// @route   GET /api/camps
// @access  Private
const getCamps = asyncHandler(async (req, res) => {
  // Fetch camps that have dates in the future or today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const camps = await DonationCamp.find({ date: { $gte: today } })
    .populate('hospital', 'name location email phone')
    .sort({ date: 1 });

  res.json(camps);
});

export { createCamp, getCamps };
