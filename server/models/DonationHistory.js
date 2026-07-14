import mongoose from 'mongoose';

const donationHistorySchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    unitsDonated: {
      type: Number,
      required: true,
      min: 1,
    },
    donationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const DonationHistory = mongoose.model('DonationHistory', donationHistorySchema);
export default DonationHistory;
