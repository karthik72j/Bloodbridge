import mongoose from 'mongoose';

const donorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    weight: {
      type: Number,
      required: true,
      min: 45,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    upcomingAppointment: {
      campName: String,
      date: Date,
      location: String,
    },
    healthDeclarations: {
      type: Boolean,
      default: true, // simplified for this project
    },
    totalDonations: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

// Virtual field for eligibility status
donorProfileSchema.virtual('eligibilityStatus').get(function () {
  if (!this.lastDonationDate) return true;
  
  const ninetyDaysInMillis = 90 * 24 * 60 * 60 * 1000;
  const timeSinceLastDonation = Date.now() - this.lastDonationDate.getTime();
  
  return timeSinceLastDonation >= ninetyDaysInMillis;
});

// Ensure virtuals are included in JSON output
donorProfileSchema.set('toJSON', { virtuals: true });
donorProfileSchema.set('toObject', { virtuals: true });

const DonorProfile = mongoose.model('DonorProfile', donorProfileSchema);
export default DonorProfile;
