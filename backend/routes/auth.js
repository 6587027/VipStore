// backend/routes/auth.js 
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model

// Test users database 
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


// หลัง const testUsers = [...];
if (!global.passwordRequestHistory) {
  global.passwordRequestHistory = [];
}

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

// POST /api/auth/register - User registration (Customer only)
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

      // Create new user in MongoDB (Customer only)
      const newUser = new User({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password, // In production: hash this password with bcrypt
        role: 'customer', // Force customer role for register
        lastLogin: new Date()
      });

      // Save user to database
      await newUser.save();

      console.log(`✅ New customer registered: ${newUser.username}`);

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

// 🆕 POST /api/auth/create-admin - Create Admin (WITH 10 ADMIN LIMIT)
router.post('/create-admin', async (req, res) => {
  try {
    const { username, email, firstName, lastName, password } = req.body;

    console.log('📥 Create Admin Request:', { username, email, firstName, lastName });

    // Validation
    if (!username || !email || !firstName || !lastName || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อผู้ใช้, อีเมล, ชื่อ, นามสกุล, รหัสผ่าน)'
      });
    }

    // 🚨 CHECK ADMIN LIMIT - COUNT CURRENT ADMINS IN DATABASE
    try {
      const currentAdminCount = await User.countDocuments({ 
        role: 'admin',
        isActive: { $ne: false } // Count only active admins
      });
      
      console.log(`📊 Current Admin Count: ${currentAdminCount}/10`);

      if (currentAdminCount >= 10) {
        return res.status(403).json({
          success: false,
          message: `❌ ไม่สามารถสร้าง Admin เพิ่มได้! มี Admin ครบ 10 คนแล้ว (${currentAdminCount}/10)`
        });
      }

      console.log(`✅ Admin limit check passed: ${currentAdminCount}/10 - Can create ${10 - currentAdminCount} more`);

    } catch (countError) {
      console.error('Error counting admins:', countError);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถตรวจสอบจำนวน Admin ได้'
      });
    }

    // Username validation
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'
      });
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาใส่อีเมลที่ถูกต้อง'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
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
        const field = existingUser.username.toLowerCase() === username.toLowerCase() ? 'ชื่อผู้ใช้' : 'อีเมล';
        return res.status(409).json({
          success: false,
          message: `${field}นี้มีอยู่ในระบบแล้ว`
        });
      }

      // Create new admin in MongoDB
      const newAdmin = new User({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password, // In production: hash this password with bcrypt
        role: 'admin', // 🎯 Force admin role
        lastLogin: new Date(),
        isActive: true
      });

      // Save admin to database
      await newAdmin.save();

      // Get updated admin count
      const updatedAdminCount = await User.countDocuments({ 
        role: 'admin',
        isActive: { $ne: false }
      });

      console.log(`✅ New admin created successfully: ${newAdmin.username} (${updatedAdminCount}/10)`);

      // Return success with admin data (without password)
      res.status(201).json({
        success: true,
        message: `✅ สร้าง Admin สำเร็จ! (${updatedAdminCount}/10)`,
        user: sanitizeUser(newAdmin),
        adminStats: {
          current: updatedAdminCount,
          maximum: 10,
          remaining: 10 - updatedAdminCount
        }
      });

    } catch (dbError) {
      console.error('MongoDB admin creation failed:', dbError);
      
      // Handle duplicate key error
      if (dbError.code === 11000) {
        const field = Object.keys(dbError.keyPattern)[0];
        const fieldName = field === 'username' ? 'ชื่อผู้ใช้' : 'อีเมล';
        return res.status(409).json({
          success: false,
          message: `${fieldName}นี้มีอยู่ในระบบแล้ว`
        });
      }

      // Handle validation errors
      if (dbError.name === 'ValidationError') {
        const errors = Object.values(dbError.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: errors[0] || 'ข้อมูลไม่ถูกต้อง'
        });
      }

      // If MongoDB fails, inform user
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
      });
    }

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 🆕 PUT /api/auth/users/:id - Update user information
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role } = req.body;

    console.log(`📝 Update user request: ${id}`, { username, email, firstName, lastName, role });

    // Validation
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'ชื่อผู้ใช้และอีเมลจำเป็นต้องกรอก'
      });
    }

    try {
      // Find and update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          firstName: firstName?.trim() || '',
          lastName: lastName?.trim() || '',
          role: role || 'customer',
          updatedAt: new Date()
        },
        { 
          new: true, // Return updated document
          runValidators: true // Run schema validators
        }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข'
        });
      }

      console.log(`✅ User updated successfully: ${updatedUser.username}`);

      res.json({
        success: true,
        message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
        user: sanitizeUser(updatedUser)
      });

    } catch (dbError) {
      console.error('MongoDB update failed:', dbError);
      
      // Handle duplicate key error
      if (dbError.code === 11000) {
        const field = Object.keys(dbError.keyPattern)[0];
        const fieldName = field === 'username' ? 'ชื่อผู้ใช้' : 'อีเมล';
        return res.status(409).json({
          success: false,
          message: `${fieldName}นี้มีอยู่ในระบบแล้ว`
        });
      }

      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถอัปเดตข้อมูลได้'
      });
    }

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 🆕 DELETE /api/auth/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Delete user request: ${id}`);

    try {
      // Find and delete user
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้ที่ต้องการลบ'
        });
      }

      console.log(`✅ User deleted successfully: ${deletedUser.username}`);

      res.json({
        success: true,
        message: 'ลบผู้ใช้สำเร็จ',
        deletedUser: sanitizeUser(deletedUser)
      });

    } catch (dbError) {
      console.error('MongoDB delete failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถลบผู้ใช้ได้'
      });
    }

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
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
      const mongoUsers = await User.find({ isActive: { $ne: false } }).select('-password');
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
      stats.totalUsers = await User.countDocuments({ isActive: { $ne: false } });
      stats.adminUsers = await User.countDocuments({ role: 'admin', isActive: { $ne: false } });
      stats.customerUsers = await User.countDocuments({ role: 'customer', isActive: { $ne: false } });
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      stats.recentRegistrations = await User.countDocuments({ 
        createdAt: { $gte: oneDayAgo },
        isActive: { $ne: false } 
      });

      console.log('📊 User statistics:', stats);
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

// 🆕 POST /api/auth/password-change-request - Password change request
router.post('/password-change-request', async (req, res) => {
  try {
    const { userId, username, email, fullName, reason, requestDate } = req.body;

    console.log('📨 Password Change Request:', { userId, username, email, fullName, reason });

    // Validation
    if (!userId || !username || !reason) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ครบถ้วน กรุณาลองใหม่อีกครั้ง'
      });
    }

    // Create password change request (ในระบบจริงควรเก็บใน Database)
    // สำหรับ Demo นี้เราจะ log ข้อมูลและส่ง notification ไป Admin
    const passwordRequest = {
      id: Date.now().toString(),
      userId,
      username,
      email,
      fullName: fullName || username,
      reason: reason.trim(),
      requestDate: requestDate || new Date().toISOString(),
      status: 'pending',
      adminNotified: true
    };

    // ในระบบจริง ควรเก็บข้อมูลนี้ใน Database
    // await PasswordChangeRequest.create(passwordRequest);

    // Log การขอเปลี่ยนรหัสผ่าน (สำหรับ Admin ดู)
    console.log('🔐 PASSWORD CHANGE REQUEST:');
    console.log('='.repeat(50));
    console.log(`👤 User: ${fullName} (@${username})`);
    console.log(`📧 Email: ${email}`);
    console.log(`📝 Reason: ${reason}`);
    console.log(`📅 Request Date: ${new Date(requestDate).toLocaleString('th-TH')}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log('='.repeat(50));
    console.log('🚨 ADMIN ACTION REQUIRED: Password change request needs approval');
    console.log('');

    // ในระบบจริง อาจส่งอีเมลหรือ notification ไป Admin
    // await sendAdminNotification(passwordRequest);

    // บันทึก notification สำหรับ Admin (ใน memory สำหรับ demo)
    if (!global.adminNotifications) {
      global.adminNotifications = [];
    }
    
    global.adminNotifications.push({
      id: passwordRequest.id,
      type: 'password_change_request',
      title: '🔐 คำขอเปลี่ยนรหัสผ่าน',
      message: `${fullName} (@${username}) ขอเปลี่ยนรหัสผ่าน`,
      details: passwordRequest,
      timestamp: new Date().toISOString(),
      read: false
    });

    console.log(`📬 Admin notification created. Total pending: ${global.adminNotifications.filter(n => !n.read).length}`);

    res.json({
      success: true,
      message: 'ส่งคำขอเปลี่ยนรหัสผ่านสำเร็จ Admin จะตรวจสอบและติดต่อกลับเร็วๆ นี้',
      requestId: passwordRequest.id
    });

  } catch (error) {
    console.error('Password change request error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ ไม่สามารถส่งคำขอได้'
    });
  }
});

// 🆕 GET /api/auth/admin-notifications - Get admin notifications (for User Management)
router.get('/admin-notifications', async (req, res) => {
  try {
    // ในระบบจริงควร check admin permission ก่อน
    
    const notifications = global.adminNotifications || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    
    res.json({
      success: true,
      notifications: notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      unreadCount
    });
    
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูล notifications ได้'
    });
  }
});

// 🆕 PUT /api/auth/admin-notifications/:id/read - Mark notification as read
router.put('/admin-notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!global.adminNotifications) {
      global.adminNotifications = [];
    }
    
    const notification = global.adminNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      console.log(`📬 Notification ${id} marked as read`);
    }
    
    res.json({
      success: true,
      message: 'อัปเดตสถานะการอ่านแล้ว'
    });
    
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถอัปเดตสถานะได้'
    });
  }
});


// 🆕 PUT /api/auth/admin/change-password/:userId - Admin change user password
router.put('/admin/change-password/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword, adminId, reason } = req.body;

    console.log('🔐 Admin Password Change Request:', { userId, adminId, reason });

    // Validation
    if (!newPassword || !adminId) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ครบถ้วน กรุณาใส่รหัสผ่านใหม่'
      });
    }

    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
      });
    }

    try {
      // Find the user to update
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้ที่ต้องการเปลี่ยนรหัสผ่าน'
        });
      }

      // Find admin user for logging
      let adminUser = null;
      try {
        adminUser = await User.findById(adminId);
      } catch (adminError) {
        console.log('Admin user not found in database, might be test user');
      }

      // Update password
      user.password = newPassword; // In production: hash with bcrypt
      user.lastPasswordChange = new Date();
      user.passwordChangedBy = adminId;
      await user.save();

      // Log the password change
      console.log('🔐 PASSWORD CHANGED BY ADMIN:');
      console.log('='.repeat(60));
      console.log(`👤 Target User: ${user.firstName} ${user.lastName} (@${user.username})`);
      console.log(`📧 User Email: ${user.email}`);
      console.log(`👨‍💼 Changed by Admin: ${adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'System Admin'}`);
      console.log(`📝 Reason: ${reason || 'ไม่ระบุเหตุผล'}`);
      console.log(`📅 Change Date: ${new Date().toLocaleString('th-TH')}`);
      console.log(`🆔 User ID: ${userId}`);
      console.log(`🔐 New Password: ${newPassword}`);
      console.log('='.repeat(60));

      // Remove related password change requests from notifications
      if (global.adminNotifications) {
        global.adminNotifications = global.adminNotifications.filter(
          notification => !(
            notification.type === 'password_change_request' && 
            notification.details.userId === userId
          )
        );
        console.log('🗑️ Removed related password change requests from notifications');
      }

      res.json({
        success: true,
        message: `✅ เปลี่ยนรหัสผ่านสำหรับ ${user.firstName} ${user.lastName} สำเร็จ`,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          lastPasswordChange: user.lastPasswordChange
        }
      });

    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง'
      });
    }

  } catch (error) {
    console.error('Admin change password error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 🆕 DELETE /api/auth/admin-notifications/:id - Delete/Reject password change request
router.delete('/admin-notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, rejectionReason } = req.body;

    if (!global.adminNotifications) {
      global.adminNotifications = [];
    }

    const notificationIndex = global.adminNotifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ notification ที่ต้องการลบ'
      });
    }

    const notification = global.adminNotifications[notificationIndex];
    
    // Log rejection
    console.log('❌ PASSWORD CHANGE REQUEST REJECTED:');
    console.log('='.repeat(50));
    console.log(`👤 User: ${notification.details.fullName} (@${notification.details.username})`);
    console.log(`📧 Email: ${notification.details.email}`);
    console.log(`📝 Original Reason: ${notification.details.reason}`);
    console.log(`❌ Rejection Reason: ${rejectionReason || 'ไม่ระบุเหตุผล'}`);
    console.log(`📅 Rejected Date: ${new Date().toLocaleString('th-TH')}`);
    console.log('='.repeat(50));

    // Remove notification
    global.adminNotifications.splice(notificationIndex, 1);

    res.json({
      success: true,
      message: 'ปฏิเสธคำขอเปลี่ยนรหัสผ่านแล้ว',
      deletedNotification: notification
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถลบ notification ได้'
    });
  }
});

// เพิ่มก่อน module.exports = router;

// 🆕 GET /api/auth/password-requests - Get all password requests
router.get('/password-requests', async (req, res) => {
  try {
    // Get all password change requests from notifications
    const notifications = global.adminNotifications || [];
    const passwordRequests = notifications
      .filter(n => n.type === 'password_change_request')
      .map(n => ({
        id: n.id,
        userId: n.details.userId,
        userName: n.details.fullName || n.details.username,
        userEmail: n.details.email,
        reason: n.details.reason,
        status: 'pending',
        createdAt: n.timestamp,
        requestedBy: n.details.userId
      }));

    res.json({
      success: true,
      requests: passwordRequests
    });

  } catch (error) {
    console.error('Get password requests error:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลคำขอได้'
    });
  }
});

// 🆕 POST /api/auth/request-password-change - Request password change
router.post('/request-password-change', async (req, res) => {
  try {
    const { userId, requestedBy, reason } = req.body;

    // Find user data
    let user = null;
    try {
      user = await User.findById(userId);
    } catch (dbError) {
      console.log('User not found in MongoDB, checking test users');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้ที่ต้องการเปลี่ยนรหัสผ่าน'
      });
    }

    // Create password change request
    const passwordRequest = {
      id: Date.now().toString(),
      userId,
      username: user.username,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      reason: reason.trim(),
      requestDate: new Date().toISOString(),
      status: 'pending',
      requestedBy
    };

    // Add to notifications
    if (!global.adminNotifications) {
      global.adminNotifications = [];
    }
    
    global.adminNotifications.push({
      id: passwordRequest.id,
      type: 'password_change_request',
      title: '🔐 คำขอเปลี่ยนรหัสผ่าน',
      message: `${passwordRequest.fullName} (@${user.username}) ขอเปลี่ยนรหัสผ่าน`,
      details: passwordRequest,
      timestamp: new Date().toISOString(),
      read: false
    });

    console.log(`🔐 Password change request created for: ${user.username}`);
 
    res.json({
      success: true,
      message: 'ส่งคำขอเปลี่ยนรหัสผ่านสำเร็จ',
      requestId: passwordRequest.id
    });

  } catch (error) {
    console.error('Request password change error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});



router.put('/approve-password-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, approvedBy } = req.body;

    // Find notification
    if (!global.adminNotifications) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอเปลี่ยนรหัสผ่าน'
      });
    }

    const notification = global.adminNotifications.find(n => n.id === id);
    if (!notification || notification.type !== 'password_change_request') {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอเปลี่ยนรหัสผ่าน'
      });
    }

    // Update user password
    try {
      const user = await User.findById(notification.details.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้ในระบบ'
        });
      }

      user.password = newPassword;
      user.lastPasswordChange = new Date();
      user.passwordChangedBy = approvedBy;
      await user.save();

      // 🆕 เก็บประวัติการอนุมัติ
      const historyRecord = {
        id: notification.id,
        userId: notification.details.userId,
        reason: notification.details.reason,
        status: 'approved',
        createdAt: notification.timestamp,
        approvedAt: new Date().toISOString(),
        approvedBy: approvedBy,
        userName: notification.details.fullName || notification.details.username,
        userEmail: notification.details.email
      };

      // เพิ่มเข้า history
      global.passwordRequestHistory.push(historyRecord);

      // ลบออกจาก notifications (เพราะดำเนินการแล้ว)
      global.adminNotifications = global.adminNotifications.filter(n => n.id !== id);

      console.log(`✅ Password approved and saved to history for: ${user.username}`);

      res.json({
        success: true,
        message: 'อนุมัติและเปลี่ยนรหัสผ่านสำเร็จ'
      });

    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
      });
    }

  } catch (error) {
    console.error('Approve password request error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 3. แทนที่ router.put('/reject-password-request/:id') เดิม (ประมาณบรรทัดที่ 850+)
router.put('/reject-password-request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, rejectedBy } = req.body;

    // Find and remove notification
    if (!global.adminNotifications) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอเปลี่ยนรหัสผ่าน'
      });
    }

    const notificationIndex = global.adminNotifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอเปลี่ยนรหัสผ่าน'
      });
    }

    const notification = global.adminNotifications[notificationIndex];
    
    // 🆕 เก็บประวัติการปฏิเสธ
    const historyRecord = {
      id: notification.id,
      userId: notification.details.userId,
      reason: notification.details.reason,
      status: 'rejected',
      createdAt: notification.timestamp,
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectedBy,
      rejectionReason: rejectionReason,
      userName: notification.details.fullName || notification.details.username,
      userEmail: notification.details.email
    };

    // เพิ่มเข้า history
    global.passwordRequestHistory.push(historyRecord);
    
    // Log rejection
    console.log(`❌ Password request rejected and saved to history for: ${notification.details.username}`);
    console.log(`❌ Reason: ${rejectionReason}`);

    // ลบออกจาก notifications (เพราะดำเนินการแล้ว)
    global.adminNotifications.splice(notificationIndex, 1);

    res.json({
      success: true,
      message: 'ปฏิเสธคำขอเปลี่ยนรหัสผ่านแล้ว'
    });

  } catch (error) {
    console.error('Reject password request error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// ✅ แทนที่ฟังก์ชัน GET /user-password-requests/:userId เดิมใน backend/routes/auth.js

router.get('/user-password-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔍 === PASSWORD REQUEST DEBUG START ===');
    console.log('🔍 User ID received:', userId);
    console.log('🔍 User ID type:', typeof userId);
    
    // ✅ Convert userId to string for comparison
    const userIdString = userId.toString();
    
    // Debug global variables
    console.log('📋 Global adminNotifications exists:', !!global.adminNotifications);
    console.log('📋 adminNotifications length:', global.adminNotifications?.length || 0);
    console.log('📋 Global passwordRequestHistory exists:', !!global.passwordRequestHistory);
    console.log('📋 passwordRequestHistory length:', global.passwordRequestHistory?.length || 0);
    
    // แสดงข้อมูลใน global variables
    if (global.adminNotifications && global.adminNotifications.length > 0) {
      console.log('📋 All notifications:');
      global.adminNotifications.forEach((notif, index) => {
        console.log(`  ${index}: Type=${notif.type}, UserId=${notif.details?.userId}, UserIdType=${typeof notif.details?.userId}`);
      });
    }
    
    if (global.passwordRequestHistory && global.passwordRequestHistory.length > 0) {
      console.log('📜 All history records:');
      global.passwordRequestHistory.forEach((record, index) => {
        console.log(`  ${index}: UserId=${record.userId}, UserIdType=${typeof record.userId}, Status=${record.status}`);
      });
    }
    
    // 1. ดึงคำขอที่รอดำเนินการ (จาก notifications)
    const notifications = global.adminNotifications || [];
    const pendingRequests = notifications
      .filter(n => {
        const isPasswordRequest = n.type === 'password_change_request';
        // ✅ เปรียบเทียบแบบ string กับ string
        const userIdMatch = n.details?.userId?.toString() === userIdString;
        console.log(`📋 Checking notification: type=${n.type}, userId=${n.details?.userId}, targetUserId=${userIdString}, match=${isPasswordRequest && userIdMatch}`);
        return isPasswordRequest && userIdMatch;
      })
      .map(n => ({
        id: n.id,
        reason: n.details.reason,
        status: 'pending',
        createdAt: n.timestamp,
        userId: n.details.userId,
        userName: n.details.fullName || n.details.username,
        userEmail: n.details.email
      }));

    console.log('📋 Pending requests found:', pendingRequests.length);

    // 2. ดึงประวัติที่ดำเนินการแล้ว (จาก history)
    const history = global.passwordRequestHistory || [];
    const completedRequests = history
      .filter(record => {
        // ✅ เปรียบเทียบแบบ string กับ string
        const userIdMatch = record.userId?.toString() === userIdString;
        console.log(`📜 Checking history: recordUserId=${record.userId}, targetUserId=${userIdString}, match=${userIdMatch}`);
        return userIdMatch;
      })
      .map(record => ({
        id: record.id,
        reason: record.reason,
        status: record.status,
        createdAt: record.createdAt,
        approvedAt: record.approvedAt,
        rejectedAt: record.rejectedAt,
        rejectionReason: record.rejectionReason,
        userId: record.userId,
        userName: record.userName,
        userEmail: record.userEmail
      }));

    console.log('📜 Completed requests found:', completedRequests.length);

    // 3. รวมกันและเรียงตามวันที่
    const allRequests = [
      ...pendingRequests,
      ...completedRequests
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('📊 Total requests for user:', allRequests.length);
    console.log('📊 Summary:');
    console.log(`  - Pending: ${pendingRequests.length}`);
    console.log(`  - Completed: ${completedRequests.length}`);
    console.log(`  - Total: ${allRequests.length}`);
    
    // ✅ Debug: แสดงผลลัพธ์ที่ส่งกลับ
    if (allRequests.length > 0) {
      console.log('📋 Requests to return:');
      allRequests.forEach((req, index) => {
        console.log(`  ${index}: ID=${req.id}, Status=${req.status}, Reason="${req.reason}"`);
      });
    }
    
    console.log('🔍 === PASSWORD REQUEST DEBUG END ===');
    
    res.json({
      success: true,
      message: `Found ${allRequests.length} password requests`,
      requests: allRequests,
      summary: {
        total: allRequests.length,
        pending: pendingRequests.length,
        approved: completedRequests.filter(r => r.status === 'approved').length,
        rejected: completedRequests.filter(r => r.status === 'rejected').length
      },
      debug: {
        userId: userIdString,
        notificationsCount: notifications.length,
        historyCount: history.length,
        pendingFound: pendingRequests.length,
        completedFound: completedRequests.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching user password requests:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงประวัติคำขอ',
      error: error.message
    });
  }
});



// 🆕 GET /api/auth/address-profiles/:userId - Get user's address profiles
router.get('/address-profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📋 Get address profiles for user:', userId);

    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้'
        });
      }

      res.json({
        success: true,
        addressProfiles: user.addressProfiles,
        total: user.addressProfiles.length,
        maxAllowed: 5
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถดึงข้อมูลที่อยู่ได้'
      });
    }

  } catch (error) {
    console.error('Get address profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 🆕 POST /api/auth/address-profiles/:userId - Add new address profile
router.post('/address-profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { profileName, firstName, lastName, phone, address, isDefault } = req.body;

    console.log('➕ Add address profile for user:', userId, { profileName });

    // Validation
    if (!profileName || !firstName || !lastName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'
      });
    }

    // Validate postal code
    if (!/^[0-9]{5}$/.test(address.postalCode)) {
      return res.status(400).json({
        success: false,
        message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
      });
    }

    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้'
        });
      }

      // Check if already have 5 profiles
      if (user.addressProfiles.length >= 5) {
        return res.status(400).json({
          success: false,
          message: 'สามารถสร้างที่อยู่ได้สูงสุด 5 รายการเท่านั้น'
        });
      }

      // Check if profile name already exists
      const existingProfile = user.addressProfiles.find(
        profile => profile.profileName.toLowerCase() === profileName.toLowerCase()
      );

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: 'ชื่อโปรไฟล์นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น'
        });
      }

      // Add new profile
      const newProfile = user.addAddressProfile({
        profileName: profileName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        address: {
          street: address.street.trim(),
          district: address.district.trim(),
          province: address.province.trim(),
          postalCode: address.postalCode.trim(),
          country: address.country || 'Thailand',
          notes: address.notes?.trim() || ''
        },
        isDefault: isDefault || false
      });

      await user.save();

      console.log('✅ Address profile added successfully:', newProfile.profileId);

      res.status(201).json({
        success: true,
        message: 'เพิ่มที่อยู่สำเร็จ',
        profile: newProfile,
        total: user.addressProfiles.length
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      if (dbError.message.includes('Maximum 5 address profiles')) {
        return res.status(400).json({
          success: false,
          message: 'สามารถสร้างที่อยู่ได้สูงสุด 5 รายการเท่านั้น'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถเพิ่มที่อยู่ได้'
      });
    }

  } catch (error) {
    console.error('Add address profile error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 🆕 PUT /api/auth/address-profiles/:userId/:profileId - Update address profile
router.put('/address-profiles/:userId/:profileId', async (req, res) => {
  try {
    const { userId, profileId } = req.params;
    const updateData = req.body;

    console.log('✏️ Update address profile:', { userId, profileId });

    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้'
        });
      }

      // Validate phone number if provided
      if (updateData.phone && !/^[0-9]{10}$/.test(updateData.phone)) {
        return res.status(400).json({
          success: false,
          message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก'
        });
      }

      // Validate postal code if provided
      if (updateData.address?.postalCode && !/^[0-9]{5}$/.test(updateData.address.postalCode)) {
        return res.status(400).json({
          success: false,
          message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'
        });
      }

      // Check if new profile name conflicts (if changing name)
      if (updateData.profileName) {
        const existingProfile = user.addressProfiles.find(
          profile => profile.profileId !== profileId && 
                    profile.profileName.toLowerCase() === updateData.profileName.toLowerCase()
        );

        if (existingProfile) {
          return res.status(400).json({
            success: false,
            message: 'ชื่อโปรไฟล์นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น'
          });
        }
      }

      const updatedProfile = user.updateAddressProfile(profileId, updateData);
      await user.save();

      console.log('✅ Address profile updated successfully:', profileId);

      res.json({
        success: true,
        message: 'อัปเดตที่อยู่สำเร็จ',
        profile: updatedProfile
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      if (dbError.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบที่อยู่ที่ต้องการแก้ไข'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถอัปเดตที่อยู่ได้'
      });
    }

  } catch (error) {
    console.error('Update address profile error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 🆕 DELETE /api/auth/address-profiles/:userId/:profileId - Delete address profile
router.delete('/address-profiles/:userId/:profileId', async (req, res) => {
  try {
    const { userId, profileId } = req.params;

    console.log('🗑️ Delete address profile:', { userId, profileId });

    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้'
        });
      }

      // Don't allow deleting if only one profile left
      if (user.addressProfiles.length <= 1) {
        return res.status(400).json({
          success: false,
          message: 'ต้องมีที่อยู่อย่างน้อย 1 รายการ'
        });
      }

      user.deleteAddressProfile(profileId);
      await user.save();

      console.log('✅ Address profile deleted successfully:', profileId);

      res.json({
        success: true,
        message: 'ลบที่อยู่สำเร็จ',
        total: user.addressProfiles.length
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      
      if (dbError.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบที่อยู่ที่ต้องการลบ'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถลบที่อยู่ได้'
      });
    }

  } catch (error) {
    console.error('Delete address profile error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 🆕 PUT /api/auth/address-profiles/:userId/:profileId/set-default - Set default address
router.put('/address-profiles/:userId/:profileId/set-default', async (req, res) => {
  try {
    const { userId, profileId } = req.params;

    console.log('⭐ Set default address profile:', { userId, profileId });

    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้'
        });
      }

      // Set all profiles to non-default first
      user.addressProfiles.forEach(profile => {
        profile.isDefault = false;
      });

      // Find and set the target profile as default
      const targetProfile = user.addressProfiles.find(p => p.profileId === profileId);
      
      if (!targetProfile) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบที่อยู่ที่ต้องการ'
        });
      }

      targetProfile.isDefault = true;
      await user.save();

      console.log('✅ Default address profile set successfully:', profileId);

      res.json({
        success: true,
        message: 'ตั้งเป็นที่อยู่หลักสำเร็จ',
        profile: targetProfile
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถตั้งเป็นที่อยู่หลักได้'
      });
    }

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

// 🆕 GET /api/auth/address-profiles/:userId/default - Get default address profile
router.get('/address-profiles/:userId/default', async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบผู้ใช้'
        });
      }

      const defaultProfile = user.getDefaultAddressProfile();

      res.json({
        success: true,
        defaultProfile,
        hasDefault: !!defaultProfile
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'ไม่สามารถดึงข้อมูลที่อยู่หลักได้'
      });
    }

  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในระบบ'
    });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { userId, newPassword, requestId } = req.body;
    
    // Hash password ใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update user password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    
    // Mark request as completed
    await PasswordRequest.findByIdAndUpdate(requestId, { 
      status: 'completed',
      passwordChanged: true 
    });
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;