// backend/routes/orders.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');


// ✅ POST /api/orders - Create new order 
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      customerInfo, 
      items, 
      pricing 
    } = req.body;

    console.log('📝 Creating order with data:', { userId, customerInfo, items: items?.length, pricing });

    // Validate required fields
    if (!customerInfo || !items || !pricing) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order information'
      });
    }

    // Validate items and calculate totals
    let calculatedSubtotal = 0;
    const processedItems = [];

    for (const item of items) {
      try {
        // Verify product exists and has sufficient stock
        const product = await Product.findById(item.productId);
        if (!product) {
          console.log(`❌ Product not found: ${item.productId}`);
          return res.status(400).json({
            success: false,
            message: `Product not found: ${item.productName || item.productId}`
          });
        }

        console.log(`✅ Product found: ${product.name}, Stock: ${product.stock}, Requested: ${item.quantity}`);

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
          });
        }

        const itemSubtotal = product.price * item.quantity;
        calculatedSubtotal += itemSubtotal;

        processedItems.push({
          productId: product._id,
          productName: product.name,
          productImage: product.image,
          quantity: item.quantity,
          price: product.price,
          subtotal: itemSubtotal
        });

        // Update product stock
        product.stock -= item.quantity;
        await product.save();
        console.log(`📦 Updated stock for ${product.name}: ${product.stock + item.quantity} → ${product.stock}`);

      } catch (productError) {
        console.error(`Error processing product ${item.productId}:`, productError);
        return res.status(400).json({
          success: false,
          message: `Error processing product: ${item.productName || 'Unknown'}`
        });
      }
    }

    // Validate pricing
    if (Math.abs(calculatedSubtotal - pricing.subtotal) > 0.01) {
      console.log(`💰 Price mismatch: calculated ${calculatedSubtotal}, received ${pricing.subtotal}`);
      return res.status(400).json({
        success: false,
        message: 'Price calculation mismatch'
      });
    }

    // ✅ แก้ไขการสร้าง Order - ไม่ต้องส่ง orderNumber
    const orderData = {
      customerInfo,
      items: processedItems,
      pricing,
      status: 'pending',
      paymentStatus: 'pending'
    };

    // ✅ เพิ่ม userId เฉพาะเมื่อมีค่า
    if (userId) {
      orderData.userId = userId;
    }

    console.log('🚀 Creating order with processed data:', {
      userId: orderData.userId,
      itemCount: orderData.items.length,
      total: orderData.pricing.total
    });

    const newOrder = new Order(orderData);
    await newOrder.save();

    console.log(`✅ Order created successfully: ${newOrder.orderNumber}`);

    // Populate product references
    await newOrder.populate('items.productId');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// ✅ GET /api/orders/my-orders - Get user's orders
router.get('/my-orders', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const orders = await Order.find({ userId })
      .populate('items.productId')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      orders,
      total: orders.length
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// ✅ GET /api/orders/:id - Get single order details
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId')
      .populate('userId', 'firstName lastName email username');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// 👨‍💼 ADMIN ENDPOINTS

// ✅ GET /api/orders/admin/all - Get all orders (Admin)
router.get('/admin/all', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.productId')
      .populate('userId', 'firstName lastName email username')
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: page * 1,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// ✅ PUT /api/orders/admin/:id/status - Update order status (Admin)
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    // Set delivery date if status changes to delivered
    if (status === 'delivered') {
      updateData.deliveryDate = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

// DELETE /api/orders/admin/:orderId - ลบออเดอร์
router.delete('/admin/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // ค้นหาและลบออเดอร์
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    
    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์ที่ต้องการลบ'
      });
    }
    
    res.json({
      success: true,
      message: 'ลบออเดอร์สำเร็จ',
      deletedOrder: deletedOrder
    });
    
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบออเดอร์'
    });
  }
});

// ✅ GET /api/orders/admin/stats - Get order statistics (Admin)
router.get('/admin/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      totalRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ orderDate: { $gte: today } }),
      Order.countDocuments({ orderDate: { $gte: thisWeek } }),
      Order.countDocuments({ orderDate: { $gte: thisMonth } }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;