// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model

// Test users database (เก็บไว้เป็น fallback)
const testUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@vipstore.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    lastLogin: null
  }
];

// Helper function to sanitize user data for response
const sanitizeUser = (user) => {
  if (user.getPublicProfile) {
    // MongoDB user object
    return user.getPublicProfile();
  } else {
    // Test user object
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
};

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    let user = null;

    try {
      // Try MongoDB first - ใช้ regex แบบง่าย
      const usernamePattern = new RegExp(`^${username}$`, 'i');
      
      user = await User.findOne({
        $or: [
          { username: usernamePattern },
          { email: usernamePattern }
        ]
      });

      // Debug: แสดงผล search query
      console.log(`🔍 Searching for user: "${username}"`);
      console.log(`🔍 Found user:`, user ? `${user.username} (${user.email})` : 'Not found');

      // If found in MongoDB
      if (user && user.password === password) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();

        console.log(`✅ Login successful for: ${user.username}`);
        return res.json({
          success: true,
          message: 'Login successful',
          user: sanitizeUser(user)
        });
      } else if (user) {
        console.log(`❌ Password mismatch for user: ${user.username}`);
        console.log(`❌ Provided: "${password}", Expected: "${user.password}"`);
      }
    } catch (dbError) {
      console.log('MongoDB query failed, using test users:', dbError.message);
    }

    // Fallback to test users
    user = testUsers.find(u => 
      (u.username.toLowerCase() === username.toLowerCase() || 
       u.email.toLowerCase() === username.toLowerCase()) && 
      u.password === password
    );

    if (!user) {
      console.log(`❌ User not found in test database: "${username}"`);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    console.log(`✅ Test user login successful: ${user.username}`);

    // Update last login for test user
    user.lastLogin = new Date();

    // Return success with user data (without password)
    res.json({
      success: true,
      message: 'Login successful',
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, firstName, lastName, password } = req.body;

    // Validation
    if (!username || !email || !firstName || !lastName || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    try {
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({
        $or: [
          { username: new RegExp(`^${username}$`, 'i') },
          { email: new RegExp(`^${email}$`, 'i') }
        ]
      });

      if (existingUser) {
        const field = existingUser.username.toLowerCase() === username.toLowerCase() ? 'Username' : 'Email';
        return res.status(409).json({
          success: false,
          message: `${field} already exists`
        });
      }

      // Create new user in MongoDB
      const newUser = new User({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password, // In production: hash this password with bcrypt
        role: 'customer',
        lastLogin: new Date()
      });

      // Save user to database
      await newUser.save();

      console.log(`✅ New user registered: ${newUser.username}`);

      // Return success with user data (without password)
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: sanitizeUser(newUser)
      });

    } catch (dbError) {
      console.error('MongoDB save failed:', dbError);
      
      // Handle duplicate key error
      if (dbError.code === 11000) {
        const field = Object.keys(dbError.keyPattern)[0];
        const fieldName = field === 'username' ? 'Username' : 'Email';
        return res.status(409).json({
          success: false,
          message: `${fieldName} already exists`
        });
      }

      // Handle validation errors
      if (dbError.name === 'ValidationError') {
        const errors = Object.values(dbError.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: errors[0] || 'Validation failed'
        });
      }

      // If MongoDB fails, inform user
      return res.status(500).json({
        success: false,
        message: 'Database temporarily unavailable. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/verify - Verify user session
router.get('/verify', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Session verified'
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/users - Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    let allUsers = [];

    try {
      // Try MongoDB first
      const mongoUsers = await User.find({ isActive: true }).select('-password');
      allUsers = mongoUsers.map(user => sanitizeUser(user));
    } catch (dbError) {
      console.log('MongoDB query failed, using test users:', dbError.message);
      // Fallback to test users
      allUsers = testUsers.map(user => sanitizeUser(user));
    }
    
    res.json({
      success: true,
      users: allUsers,
      total: allUsers.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/stats - Get user statistics
router.get('/stats', async (req, res) => {
  try {
    let stats = {
      totalUsers: 0,
      adminUsers: 0,
      customerUsers: 0,
      recentRegistrations: 0
    };

    try {
      // Try MongoDB first
      stats.totalUsers = await User.countDocuments({ isActive: true });
      stats.adminUsers = await User.countDocuments({ role: 'admin', isActive: true });
      stats.customerUsers = await User.countDocuments({ role: 'customer', isActive: true });
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      stats.recentRegistrations = await User.countDocuments({ 
        createdAt: { $gte: oneDayAgo },
        isActive: true 
      });
    } catch (dbError) {
      console.log('MongoDB query failed, using test data:', dbError.message);
      // Fallback to test users stats
      stats = {
        totalUsers: testUsers.length,
        adminUsers: testUsers.filter(u => u.role === 'admin').length,
        customerUsers: testUsers.filter(u => u.role === 'customer').length,
        recentRegistrations: 0
      };
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/debug - Debug users in database
router.get('/debug', async (req, res) => {
  try {
    let debugInfo = {
      mongodb: { status: 'disconnected', users: [] },
      testUsers: testUsers.map(u => ({ username: u.username, email: u.email }))
    };

    try {
      const mongoUsers = await User.find({}).select('username email role password');
      debugInfo.mongodb = {
        status: 'connected',
        users: mongoUsers.map(u => ({ 
          username: u.username, 
          email: u.email, 
          role: u.role,
          password: u.password // เพื่อ debug
        }))
      };
    } catch (dbError) {
      debugInfo.mongodb.error = dbError.message;
    }

    res.json({
      success: true,
      debug: debugInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;