import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    bloodGroupRequired: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    unitsRequested: {
      type: Number,
      required: true,
      min: 1,
    },
    urgency: {
      type: String,
      enum: ['Emergency', 'Routine'],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Fulfilled', 'Rejected'],
      default: 'Pending',
    },
    targetDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
