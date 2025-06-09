// backend/routes/reports.js - 🔥 Dynamic Reports API for Vip Store

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// 📊 GET /api/reports/overview - ข้อมูลภาพรวมทั้งหมด
router.get('/overview', async (req, res) => {
  try {
    console.log('📊 Fetching overview reports...');

    // ⏰ Setup date ranges
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 2);

    // 💰 Sales & Revenue Data
    const [
      totalRevenue,
      todayRevenue,
      yesterdayRevenue,
      weekRevenue,
      monthRevenue,
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      averageOrderValue
    ] = await Promise.all([
      // Total Revenue (excluding cancelled orders)
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      
      // Today Revenue
      Order.aggregate([
        { $match: { 
          orderDate: { $gte: today }, 
          status: { $ne: 'cancelled' } 
        }},
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      
      // Yesterday Revenue
      Order.aggregate([
        { $match: { 
          orderDate: { $gte: yesterday, $lt: today }, 
          status: { $ne: 'cancelled' } 
        }},
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      
      // Week Revenue
      Order.aggregate([
        { $match: { 
          orderDate: { $gte: thisWeek }, 
          status: { $ne: 'cancelled' } 
        }},
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      
      // Month Revenue
      Order.aggregate([
        { $match: { 
          orderDate: { $gte: thisMonth }, 
          status: { $ne: 'cancelled' } 
        }},
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      
      // Total Orders
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      
      // Today Orders
      Order.countDocuments({ 
        orderDate: { $gte: today },
        status: { $ne: 'cancelled' } 
      }),
      
      // Week Orders
      Order.countDocuments({ 
        orderDate: { $gte: thisWeek },
        status: { $ne: 'cancelled' } 
      }),
      
      // Month Orders
      Order.countDocuments({ 
        orderDate: { $gte: thisMonth },
        status: { $ne: 'cancelled' } 
      }),
      
      // Average Order Value
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { 
          _id: null, 
          avg: { $avg: '$pricing.total' },
          count: { $sum: 1 }
        } }
      ])
    ]);

    // 📈 Calculate Growth Rates
    const calculateGrowthRate = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100);
    };

    const currentRevenue = totalRevenue[0]?.total || 0;
    const todayRev = todayRevenue[0]?.total || 0;
    const yesterdayRev = yesterdayRevenue[0]?.total || 0;
    const weekRev = weekRevenue[0]?.total || 0;
    const monthRev = monthRevenue[0]?.total || 0;

    // 👥 User Statistics
    const [userStats, recentUsers] = await Promise.all([
      // Total user counts by role
      User.aggregate([
        { $group: { 
          _id: '$role',
          count: { $sum: 1 }
        } }
      ]),
      
      // Recent registrations (last 7 days)
      User.countDocuments({ 
        createdAt: { $gte: thisWeek }
      })
    ]);

    const adminCount = userStats.find(s => s._id === 'admin')?.count || 0;
    const customerCount = userStats.find(s => s._id === 'customer')?.count || 0;
    const totalUsers = adminCount + customerCount;

    // 📦 Product Statistics
    const [productStats, lowStockProducts] = await Promise.all([
      Product.aggregate([
        { $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          lowStock: { $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] } }
        }}
      ]),
      
      Product.find({ stock: { $lt: 10 }, isActive: true })
        .select('name stock')
        .limit(10)
    ]);

    const productData = productStats[0] || { total: 0, active: 0, lowStock: 0 };

    // 🛒 Order Status Distribution
    const orderStatusStats = await Order.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const orderStatus = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orderStatusStats.forEach(stat => {
      orderStatus[stat._id] = stat.count;
    });

    // 📈 Sales Trend (Last 6 months)
    const salesTrend = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: {
        _id: {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Format sales trend data
    const formatSalesTrend = salesTrend.reverse().map(item => {
      const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      return {
        month: monthNames[item._id.month - 1],
        revenue: item.revenue,
        orders: item.orders
      };
    });

    console.log('✅ Overview reports calculated successfully');

    res.json({
      success: true,
      data: {
        // 💰 Financial Overview
        revenue: {
          total: currentRevenue,
          today: todayRev,
          week: weekRev,
          month: monthRev,
          average: averageOrderValue[0]?.avg || 0,
          growthRate: calculateGrowthRate(todayRev, yesterdayRev)
        },
        
        // 🛒 Orders Overview
        orders: {
          total: totalOrders,
          today: todayOrders,
          week: weekOrders,
          month: monthOrders,
          average: averageOrderValue[0]?.avg || 0,
          statusDistribution: orderStatus
        },
        
        // 👥 Users Overview
        users: {
          total: totalUsers,
          admins: adminCount,
          customers: customerCount,
          recentRegistrations: recentUsers
        },
        
        // 📦 Products Overview
        products: {
          total: productData.total,
          active: productData.active,
          lowStock: productData.lowStock,
          lowStockList: lowStockProducts
        },
        
        // 📈 Trends
        salesTrend: formatSalesTrend,
        
        // 📊 Key Metrics
        keyMetrics: {
          conversionRate: totalOrders > 0 ? ((orderStatus.delivered / totalOrders) * 100) : 0,
          averageOrderValue: averageOrderValue[0]?.avg || 0,
          customerRetentionRate: totalUsers > 0 ? ((recentUsers / totalUsers) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('Overview reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overview reports',
      error: error.message
    });
  }
});

// 💰 GET /api/reports/sales - รายงานยอดขายละเอียด
router.get('/sales', async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date(now);
    
    switch(dateRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const salesData = await Order.aggregate([
      { $match: { 
        orderDate: { $gte: startDate },
        status: { $ne: 'cancelled' }
      }},
      { $group: {
        _id: {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' },
          day: { $dayOfMonth: '$orderDate' }
        },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: '$pricing.total' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        dateRange,
        salesData,
        summary: {
          totalRevenue: salesData.reduce((sum, day) => sum + day.revenue, 0),
          totalOrders: salesData.reduce((sum, day) => sum + day.orders, 0),
          averageDaily: salesData.length > 0 ? 
            salesData.reduce((sum, day) => sum + day.revenue, 0) / salesData.length : 0
        }
      }
    });

  } catch (error) {
    console.error('Sales reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales reports'
    });
  }
});

// 📦 GET /api/reports/products - รายงานสินค้า
router.get('/products', async (req, res) => {
  try {
    // Top selling products (based on order items)
    const topSellingProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.productId',
        productName: { $first: '$items.productName' },
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
        orderCount: { $sum: 1 }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({ 
      stock: { $lt: 10 }, 
      isActive: true 
    }).select('name stock category price').limit(20);

    // Category performance
    const categoryPerformance = await Product.aggregate([
      { $group: {
        _id: '$category',
        totalProducts: { $sum: 1 },
        activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
        totalStock: { $sum: '$stock' },
        averagePrice: { $avg: '$price' }
      }},
      { $sort: { totalProducts: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        topSellingProducts,
        lowStockProducts,
        categoryPerformance
      }
    });

  } catch (error) {
    console.error('Products reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate products reports'
    });
  }
});

// 👥 GET /api/reports/users - รายงานผู้ใช้
router.get('/users', async (req, res) => {
  try {
    // User registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: {
        _id: '$role',
        count: { $sum: 1 }
      }}
    ]);

    // Active users (users who have placed orders)
    const activeUsers = await Order.distinct('userId', { 
      status: { $ne: 'cancelled' }
    });

    res.json({
      success: true,
      data: {
        registrationTrend,
        roleDistribution,
        activeUsersCount: activeUsers.length,
        totalUsers: await User.countDocuments()
      }
    });

  } catch (error) {
    console.error('Users reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate users reports'
    });
  }
});

// 🛒 GET /api/reports/orders - รายงานออเดอร์
router.get('/orders', async (req, res) => {
  try {
    // Order status distribution
    const statusDistribution = await Order.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$pricing.total' }
      }}
    ]);

    // Payment status distribution
    const paymentDistribution = await Order.aggregate([
      { $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalValue: { $sum: '$pricing.total' }
      }}
    ]);

    // Daily order trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyOrders = await Order.aggregate([
      { $match: { orderDate: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' },
          day: { $dayOfMonth: '$orderDate' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$pricing.total' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution,
        paymentDistribution,
        dailyOrders
      }
    });

  } catch (error) {
    console.error('Orders reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate orders reports'
    });
  }
});

module.exports = router;