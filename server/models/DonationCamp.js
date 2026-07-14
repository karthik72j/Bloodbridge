import mongoose from 'mongoose';

const donationCampSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    campName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const DonationCamp = mongoose.model('DonationCamp', donationCampSchema);
export default DonationCamp;
