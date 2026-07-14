import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import seedInventory from './utils/seedInventory.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import campRoutes from './routes/campRoutes.js';

dotenv.config();

connectDB().then(async () => {
  await seedInventory();
  
  const adminCount = await User.countDocuments({ role: 'Admin' });
  if (adminCount === 0) {
    await User.create({
      name: 'System Admin',
      email: 'admin@bloodbridge.com',
      password: 'admin123',
      role: 'Admin',
      location: 'Headquarters',
      phone: '0000000000'
    });
    console.log('Default Admin user seeded successfully');
  }
});

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/camps', campRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
