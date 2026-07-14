import asyncHandler from 'express-async-handler';
import BloodRequest from '../models/BloodRequest.js';

// @desc    Create new blood request
// @route   POST /api/requests
// @access  Private/Hospital
const createRequest = asyncHandler(async (req, res) => {
  const { bloodGroupRequired, unitsRequested, urgency, location, targetDate } = req.body;

  const request = await BloodRequest.create({
    requester: req.user._id,
    bloodGroupRequired,
    unitsRequested,
    urgency,
    location,
    targetDate,
  });

  if (request) {
    res.status(201).json(request);
  } else {
    res.status(400);
    throw new Error('Invalid request data');
  }
});

// @desc    Get hospital's own pending/all requests
// @route   GET /api/requests/myrequests
// @access  Private/Hospital
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ requester: req.user._id }).sort({ createdAt: -1 });
  res.json(requests);
});

// @desc    Update request status (Admin only for fulfilled/rejected, but lets keep it simple: admin manages fulfillment)
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
const updateRequestStatus = asyncHandler(async (req, res) => {
  // implemented in Admin controller for full admin capabilities, 
  // but if needed here, we can put it. We'll leave it for the admin controller.
  res.status(501).send('Not implemented here. Use Admin routes for approval/fulfillment.');
});

export { createRequest, getMyRequests, updateRequestStatus };
