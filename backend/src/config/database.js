const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    /* Auto-seed admin user on first run */
    const User = require('../models/User');
    const adminExists = await User.findOne({ role: 'superadmin' });
    if (!adminExists) {
      await User.create({
        name:     process.env.ADMIN_NAME     || 'Super Admin',
        email:    process.env.ADMIN_EMAIL    || 'admin@banguiestdoux.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@2025!',
        role:     'superadmin',
      });
      console.log('🔑 Default admin user created');
    }
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

module.exports = connectDB;
