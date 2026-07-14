import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an Admin');
  }
};

const donor = (req, res, next) => {
  if (req.user && req.user.role === 'Donor') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a Donor');
  }
};

const hospital = (req, res, next) => {
  if (req.user && (req.user.role === 'Hospital' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a Hospital');
  }
};

export { protect, admin, donor, hospital };
