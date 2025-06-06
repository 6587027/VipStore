// backend/routes/auth.js
const express = require('express');
const router = express.Router();

// Simple user database (no need for MongoDB for this)
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@vipstore.com'
  },
  {
    id: 2,
    username: 'vip',
    password: 'vip123',
    role: 'customer',
    name: 'Vip Customer',
    email: 'vip@vipstore.com'
  },
  {
    id: 3,
    username: 'customer',
    password: 'customer123',
    role: 'customer',
    name: 'Customer User',
    email: 'customer@vipstore.com'
  }
];

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Remove password from response
    const { password: userPassword, ...userWithoutPassword } = user;

    // Success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side mainly)
// @access  Public
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// @route   GET /api/auth/users
// @desc    Get available test accounts (for development)
// @access  Public
router.get('/users', (req, res) => {
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.status(200).json({
    success: true,
    message: 'Test accounts for development',
    users: usersWithoutPasswords,
    loginInstructions: {
      admin: 'Username: admin, Password: admin123',
      customer: 'Username: vip, Password: vip123'
    }
  });
});

// @route   GET /api/auth/verify
// @desc    Verify if user is logged in (optional)
// @access  Public
router.get('/verify', (req, res) => {
  // Since we're not using JWT, this is just a placeholder
  res.status(200).json({
    success: true,
    message: 'Auth verification endpoint',
    note: 'This project uses simple session-based auth'
  });
});

module.exports = router;