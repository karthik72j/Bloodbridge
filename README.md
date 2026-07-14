# BloodBridge - Blood Donation Management System

BloodBridge is a comprehensive MERN (MongoDB, Express, React, Node.js) stack web application designed to bridge the gap between blood donors, hospitals, and blood banks. The platform facilitates seamless blood donation management, inventory tracking, and blood request handling.

## 🏗️ Architecture Information

The project follows a standard client-server architecture:

1. **Frontend (Client)**: Built with **React** and **Vite**. It handles the user interface and interactions. 
   - Uses **React Router** for navigation.
   - **Tailwind CSS** for modern and responsive styling.
   - **Axios** for API communication with the backend.
   - **Recharts** for visualizing data on dashboards.
   - **Context API / Hooks** for state management.
   
2. **Backend (Server)**: Built with **Node.js** and **Express.js**. It serves as a RESTful API.
   - **MongoDB** with **Mongoose** as the database to store users, blood inventory, requests, and camps.
   - **JWT (JSON Web Tokens)** for secure authentication and authorization.
   - Structured using the MVC (Model-View-Controller) pattern, separating routes, controllers, and database models.

### User Roles
- **Donor**: Can view nearby blood donation camps, track donation history, and schedule donations.
- **Hospital**: Can request specific blood types, view inventory, and manage their requests.
- **Admin**: Has complete control over the system, manages users (hospitals and donors), updates the central blood inventory, and oversees donation camps.

---

## 📂 File & Directory Structure

```text
e:/Clg Proj/Mern_proj/
├── client/                     # React Frontend
│   ├── public/                 # Static assets
│   ├── src/                    # React Source Code
│   │   ├── components/         # Reusable UI components (Navbar, ProtectedRoute, etc.)
│   │   ├── pages/              # Page components (Home, Login, Dashboards)
│   │   ├── App.jsx             # Main React component & Routing setup
│   │   └── main.jsx            # React application entry point
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite bundler configuration
│
└── server/                     # Node.js/Express Backend
    ├── config/                 # Database configuration (db.js)
    ├── controllers/            # API logic and request handlers
    ├── middleware/             # Express middlewares (auth, error handling)
    ├── models/                 # Mongoose Database Schemas (User, Inventory, etc.)
    ├── routes/                 # Express API routes (authRoutes, donorRoutes, etc.)
    ├── utils/                  # Helper functions (seedInventory.js)
    ├── index.js                # Main server entry point
    └── package.json            # Backend dependencies
```

---

## 💻 Code Explanations

### 1. Frontend: Role-Based Routing (`client/src/App.jsx`)
The frontend uses role-based protected routes to ensure users only access pages authorized for their role. For example, a Donor cannot access the Admin Dashboard.

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Donor restricted route */}
        <Route path="/donor/dashboard" element={
          <ProtectedRoute allowedRoles={['Donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        } />
        
        {/* Admin restricted route */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
```

### 2. Backend: Server Initialization (`server/index.js`)
The backend initializes the Express app, connects to the MongoDB database, and automatically seeds a default Admin user and initial inventory if they don't exist. It also registers modular routers for different endpoints.

```javascript
import express from 'express';
import connectDB from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';

// Connect Database and Seed Initial Data
connectDB().then(async () => {
  const adminCount = await User.countDocuments({ role: 'Admin' });
  if (adminCount === 0) {
    await User.create({
      name: 'System Admin',
      email: 'admin@bloodbridge.com',
      password: 'admin123',
      role: 'Admin',
      // ...
    });
  }
});

const app = express();
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/admin', adminRoutes);

app.listen(5000, () => {
  console.log(`Server running on port 5000`);
});
```

---

## 📝 Project Summary

**BloodBridge** is a holistic solution for managing the end-to-end process of blood donation and distribution. By dividing the application into a scalable Node/Express backend and a responsive React frontend, the project successfully handles complex role-based access for Donors, Hospitals, and Administrators. 

The integration of features such as blood inventory tracking, real-time request processing, and camp management ensures that critical resources are allocated efficiently. This project demonstrates strong full-stack development skills, encompassing database modeling, secure API design, and modern frontend user experiences.
