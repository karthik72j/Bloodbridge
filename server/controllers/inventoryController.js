import asyncHandler from 'express-async-handler';
import BloodInventory from '../models/BloodInventory.js';

// @desc    Get inventory status
// @route   GET /api/inventory
// @access  Private (All authenticated users could see this potentially, or limit to admin/hospital)
const getInventoryStatus = asyncHandler(async (req, res) => {
  const inventory = await BloodInventory.find({});
  res.json(inventory);
});

export { getInventoryStatus };
