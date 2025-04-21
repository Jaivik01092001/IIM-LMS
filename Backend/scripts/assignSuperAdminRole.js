require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function assignSuperAdminRole() {
  try {
    // Find the Super Admin role
    const superAdminRole = await Role.findOne({ name: 'Super Admin' });
    
    if (!superAdminRole) {
      console.error('Super Admin role not found. Please run the seeder first.');
      process.exit(1);
    }
    
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.error('No admin users found.');
      process.exit(1);
    }
    
    // Assign the Super Admin role to all admin users
    for (const user of adminUsers) {
      user.roleRef = superAdminRole._id;
      await user.save();
      console.log(`Assigned Super Admin role to user: ${user.name} (${user.email})`);
    }
    
    console.log('Successfully assigned Super Admin role to all admin users.');
    process.exit(0);
  } catch (error) {
    console.error('Error assigning Super Admin role:', error);
    process.exit(1);
  }
}

assignSuperAdminRole();
