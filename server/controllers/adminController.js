import asyncHandler from 'express-async-handler';
import BloodRequest from '../models/BloodRequest.js';
import BloodInventory from '../models/BloodInventory.js';
import DonationHistory from '../models/DonationHistory.js';
import DonorProfile from '../models/DonorProfile.js';
import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.pageNumber) || 1;
  const count = await User.countDocuments({});
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json({ users, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Delete user & cascade
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    // Cascading deletes
    await DonorProfile.deleteOne({ user: user._id });
    await BloodRequest.deleteMany({ requester: user._id });
    await DonationHistory.deleteMany({ donor: user._id });
    
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all blood requests (Paginated)
// @route   GET /api/admin/requests
// @access  Private/Admin
const getAllRequests = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await BloodRequest.countDocuments({});
  const requests = await BloodRequest.find({})
    .populate('requester', 'name email location phone')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ requests, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Approve/Reject request and update inventory
// @route   PUT /api/admin/requests/:id/status
// @access  Private/Admin
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const request = await BloodRequest.findById(req.params.id);

  if (request) {
    if (status === 'Approved' || status === 'Fulfilled') {
      const inventory = await BloodInventory.findOne({ bloodGroup: request.bloodGroupRequired });
      
      if (!inventory || inventory.unitsAvailable < request.unitsRequested) {
        return res.status(400).json({ message: 'Insufficient inventory to fulfill this request.' });
      }

      inventory.unitsAvailable -= request.unitsRequested;
      await inventory.save();
    }

    request.status = status;
    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } else {
    res.status(404);
    throw new Error('Request not found');
  }
});

// @desc    Record new donation
// @route   POST /api/admin/donations
// @access  Private/Admin
const recordDonation = asyncHandler(async (req, res) => {
  const { donorIdentifier, bloodGroup, unitsDonated, donationDate } = req.body;

  // Resolve donor Identifier to User _id (CastError Fix)
  const user = await User.findOne({ 
    $or: [{ email: donorIdentifier }, { phone: donorIdentifier }] 
  });

  if (!user) {
    res.status(404);
    throw new Error('Donor Not Found matching that Email or Phone.');
  }

  // Record history
  const donation = await DonationHistory.create({
    donor: user._id,
    bloodGroup,
    unitsDonated,
    donationDate: donationDate || Date.now(),
  });

  // Update Inventory Math check
  let inventory = await BloodInventory.findOne({ bloodGroup });
  if (inventory) {
    inventory.unitsAvailable += Number(unitsDonated);
    await inventory.save();
  } else {
    // create if not exists
    inventory = await BloodInventory.create({
      bloodGroup,
      unitsAvailable: unitsDonated,
    });
  }

  // Update Donor Profile lastDonationDate and Gamification totalDonations
  const donorProfile = await DonorProfile.findOne({ user: user._id });
  if (donorProfile) {
    donorProfile.lastDonationDate = donationDate || Date.now();
    donorProfile.totalDonations += 1; // Increment for gamification
    await donorProfile.save();
  }

  res.status(201).json(donation);
});

// @desc    Get donation history (Paginated)
// @route   GET /api/admin/donations
// @access  Private/Admin
const getDonationHistory = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await DonationHistory.countDocuments({});
  const history = await DonationHistory.find({})
    .populate('donor', 'name email location phone')
    .sort({ donationDate: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ history, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get Analytics (Overview)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const rawInventory = await BloodInventory.find({});
  
  // Clean format for Recharts
  const inventory = rawInventory.map(inv => ({
    bloodGroup: inv.bloodGroup,
    unitsAvailable: inv.unitsAvailable
  }));

  const totalRequests = await BloodRequest.countDocuments({});
  const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' });
  const fulfilledRequests = await BloodRequest.countDocuments({ status: 'Fulfilled' });
  
  res.json({
    inventory,
    requests: {
      total: totalRequests,
      pending: pendingRequests,
      fulfilled: fulfilledRequests,
    }
  });
});

export { getUsers, deleteUser, getAllRequests, updateRequestStatus, recordDonation, getDonationHistory, getAnalytics };
