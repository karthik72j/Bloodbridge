import BloodInventory from '../models/BloodInventory.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const seedInventory = async () => {
  try {
    const count = await BloodInventory.countDocuments();
    if (count === 0) {
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const seedData = bloodGroups.map(bg => ({
        bloodGroup: bg,
        unitsAvailable: 0
      }));
      await BloodInventory.insertMany(seedData);
      console.log('Blood Inventory seeded with default values.');
    }

    // Seed default Admin user
    const adminCount = await User.countDocuments({ role: 'Admin' });
    if (adminCount === 0) {
      await User.create({
        name: 'System Admin',
        email: 'admin@bloodbridge.com',
        password: 'admin123',
        role: 'Admin',
        location: 'HQ',
        phone: '0000000000'
      });
      console.log('Default Admin user created (admin@bloodbridge.com / admin123)');
    }
  } catch (error) {
    console.error(`Error seeding inventory: ${error.message}`);
  }
};

export default seedInventory;
