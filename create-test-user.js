// Test Script để tạo user và test authentication
// Run this in VS Code terminal: node create-test-user.js

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB (adjust connection string as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stayhub';

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['renter', 'landlord', 'technician', 'admin'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

const createTestUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      console.log('User ID:', existingUser._id);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user
    const testUser = new User({
      role: 'renter',
      name: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      password: hashedPassword,
      isEmailVerified: true, // Set to true for testing
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('User ID:', testUser._id);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUser();
