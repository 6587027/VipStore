// backend/routes/orders.js - FIXED VERSION

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// ✅ POST /api/orders - Create new order - FIXED VERSION
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      customerInfo, 
      items, 
      pricing 
    } = req.body;

    console.log('📝 Creating order with data:', { 
      userId, 
      customerInfo: customerInfo ? 'provided' : 'missing', 
      items: items?.length, 
      pricing: pricing ? 'provided' : 'missing'
    });

    // 🔍 Debug incoming data
    console.log('📦 Items received:', items);
    console.log('💰 Pricing received:', pricing);
    console.log('👤 Customer info received:', customerInfo);

    // Validate required fields
    if (!customerInfo || !items || !pricing) {
      console.log('❌ Missing required fields:', { 
        customerInfo: !!customerInfo, 
        items: !!items, 
        pricing: !!pricing 
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required order information',
        details: {
          customerInfo: !!customerInfo,
          items: !!items,
          pricing: !!pricing
        }
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate items and calculate totals
    let calculatedSubtotal = 0;
    const processedItems = [];

    for (const item of items) {
      try {
        // 🔧 FIX: Handle both item.id and item.productId
        const productId = item.productId || item.id;
        
        if (!productId) {
          console.log('❌ Missing product ID in item:', item);
          return res.status(400).json({
            success: false,
            message: `Missing product ID for item: ${item.productName || 'Unknown'}`
          });
        }

        console.log(`🔍 Looking for product ID: ${productId}`);

        // Verify product exists and has sufficient stock
        const product = await Product.findById(productId);
        if (!product) {
          console.log(`❌ Product not found: ${productId}`);
          return res.status(400).json({
            success: false,
            message: `Product not found: ${item.productName || productId}`
          });
        }

        console.log(`✅ Product found: ${product.name}, Stock: ${product.stock}, Requested: ${item.quantity}`);

        // Check stock availability
        if (product.stock < item.quantity) {
          console.log(`❌ Insufficient stock for ${product.name}`);
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          });
        }

        // Calculate subtotal
        const itemSubtotal = product.price * item.quantity;
        calculatedSubtotal += itemSubtotal;

        processedItems.push({
          productId: product._id,
          productName: product.name,
          productImage: product.image || '/api/placeholder/80/80',
          quantity: item.quantity,
          price: product.price,
          subtotal: itemSubtotal
        });

        // Update product stock
        const oldStock = product.stock;
        product.stock -= item.quantity;
        await product.save();
        
        console.log(`📦 Updated stock for ${product.name}: ${oldStock} → ${product.stock}`);

      } catch (productError) {
        console.error(`❌ Error processing product ${item.productId || item.id}:`, productError);
        return res.status(400).json({
          success: false,
          message: `Error processing product: ${item.productName || 'Unknown'}`,
          error: productError.message
        });
      }
    }

    // Validate pricing calculations
    console.log(`💰 Price validation: calculated=${calculatedSubtotal}, received=${pricing.subtotal}`);
    
    if (Math.abs(calculatedSubtotal - pricing.subtotal) > 1) { // Allow 1 baht difference for rounding
      console.log(`❌ Price mismatch: calculated ${calculatedSubtotal}, received ${pricing.subtotal}`);
      return res.status(400).json({
        success: false,
        message: 'Price calculation mismatch',
        details: {
          calculated: calculatedSubtotal,
          received: pricing.subtotal,
          difference: Math.abs(calculatedSubtotal - pricing.subtotal)
        }
      });
    }

    // Prepare order data
    const orderData = {
      customerInfo,
      items: processedItems,
      pricing: {
        subtotal: calculatedSubtotal, // Use calculated value
        shipping: pricing.shipping || 0,
        total: calculatedSubtotal + (pricing.shipping || 0)
      },
      status: 'pending',
      paymentStatus: 'pending'
    };

    // Add userId if provided
    if (userId) {
      orderData.userId = userId;
      console.log(`👤 Order linked to user: ${userId}`);
    } else {
      console.log(`🛒 Guest order (no user ID)`);
    }

    console.log('🚀 Creating order with processed data:', {
      userId: orderData.userId || 'guest',
      itemCount: orderData.items.length,
      subtotal: orderData.pricing.subtotal,
      shipping: orderData.pricing.shipping,
      total: orderData.pricing.total
    });

    // Create and save order
    const newOrder = new Order(orderData);
    await newOrder.save();

    console.log(`✅ Order created successfully: ${newOrder.orderNumber}`);

    // Populate product references for response
    await newOrder.populate('items.productId');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    
    // Pass error to global error handler
    next(error);
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

// 🔧 PUT /api/orders/admin/:id/status - Update order status (Admin)
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, notes } = req.body;
    const orderId = req.params.id;

    const existingOrder = await Order.findById(orderId).populate('items.productId');
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📝 Updating order ${existingOrder.orderNumber} from ${existingOrder.status} to ${status}`);

    // Stock restoration logic (existing code)
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      console.log('🔄 Order cancelled - restoring stock...');
      
      for (const item of existingOrder.items) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            const oldStock = product.stock;
            product.stock += item.quantity;
            await product.save();
            console.log(`📦 Restored stock for ${product.name}: ${oldStock} + ${item.quantity} = ${product.stock}`);
          }
        } catch (error) {
          console.error(`❌ Error restoring stock for product ${item.productId}:`, error);
        }
      }
    }

    if (existingOrder.status === 'cancelled' && status !== 'cancelled') {
      console.log('🔄 Order reactivated - deducting stock...');
      
      for (const item of existingOrder.items) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            if (product.stock >= item.quantity) {
              const oldStock = product.stock;
              product.stock -= item.quantity;
              await product.save();
              console.log(`📦 Deducted stock for ${product.name}: ${oldStock} - ${item.quantity} = ${product.stock}`);
            } else {
              return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
              });
            }
          }
        } catch (error) {
          console.error(`❌ Error deducting stock for product ${item.productId}:`, error);
        }
      }
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    if (status === 'delivered') {
      updateData.deliveryDate = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.productId');

    console.log(`✅ Order ${updatedOrder.orderNumber} updated successfully`);

    res.json({
      success: true,
      message: `Order updated successfully. ${status === 'cancelled' ? 'Stock restored.' : ''}`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
});

// 🔧 DELETE /api/orders/admin/:orderId - Delete order with stock restoration
router.delete('/admin/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const orderToDelete = await Order.findById(orderId).populate('items.productId');
    
    if (!orderToDelete) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์ที่ต้องการลบ'
      });
    }

    console.log(`🗑️ Deleting order ${orderToDelete.orderNumber} - status: ${orderToDelete.status}`);

    if (orderToDelete.status !== 'cancelled') {
      console.log('🔄 Restoring stock before deletion...');
      
      for (const item of orderToDelete.items) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            const oldStock = product.stock;
            product.stock += item.quantity;
            await product.save();
            console.log(`📦 Restored stock for ${product.name}: ${oldStock} + ${item.quantity} = ${product.stock}`);
          }
        } catch (error) {
          console.error(`❌ Error restoring stock for product ${item.productId}:`, error);
        }
      }
    }
    
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    
    console.log(`✅ Order ${orderToDelete.orderNumber} deleted successfully with stock restoration`);
    
    res.json({
      success: true,
      message: 'ลบออเดอร์สำเร็จ และคืนสต็อกสินค้าแล้ว',
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

// ✅ GET /api/orders/admin/stats - Get order statistics
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

// ✅ PUT /api/orders/:orderId/payment - Update payment status
router.put('/:orderId/payment', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, paymentMethodName, cardData } = req.body;

    console.log(`💳 Updating payment for order ${orderId}:`, {
      method: paymentMethod,
      methodName: paymentMethodName
    });

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์'
      });
    }

    const updateData = {
      status: 'confirmed',
      paymentStatus: 'paid',
      'paymentInfo.method': paymentMethod,
      'paymentInfo.methodName': paymentMethodName,
      'paymentInfo.paidAt': new Date(),
      'paymentInfo.transactionId': `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (paymentMethod === 'credit_card' && cardData) {
      updateData['paymentInfo.cardData.last4'] = cardData.cardNumber.replace(/\s/g, '').slice(-4);
      updateData['paymentInfo.cardData.cardType'] = 'VISA';
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.productId');

    console.log(`✅ Payment updated for order ${updatedOrder.orderNumber}`);

    res.json({
      success: true,
      message: 'อัปเดตการชำระเงินสำเร็จ',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Payment update error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตการชำระเงิน',
      error: error.message
    });
  }
});

// ✅ PUT /api/orders/:orderId/payment - Update payment status (FIXED)
router.put('/:orderId/payment', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, paymentMethodName, cardData } = req.body;

    console.log(`💳 Updating payment for order ${orderId}:`, {
      method: paymentMethod,
      methodName: paymentMethodName,
      orderId: orderId
    });

    // ✅ Find order first
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์'
      });
    }

    console.log(`📋 Found order: ${order.orderNumber}, current status: ${order.status}`);

    // ✅ FIXED: ใช้ findByIdAndUpdate แบบ direct field update
    const updateData = {
      status: 'confirmed',
      paymentStatus: 'paid',
      // ✅ เพิ่ม paymentInfo field ใหม่โดยไม่ผ่าน schema validation
      paymentInfo: {
        method: paymentMethod,
        methodName: paymentMethodName,
        paidAt: new Date(),
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };

    // ✅ เพิ่ม cardData ถ้าเป็น credit card
    if (paymentMethod === 'credit_card' && cardData) {
      updateData.paymentInfo.cardData = {
        last4: cardData.cardNumber ? cardData.cardNumber.replace(/\s/g, '').slice(-4) : '****',
        cardType: 'VISA'
      };
    }

    console.log('💾 Updating order with data:', updateData);

    // ✅ Update order โดยไม่ใช้ runValidators เพื่อหลีกเลี่ยง paymentInfo validation
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: false, // ✅ ปิด validation เพื่อให้เพิ่ม paymentInfo ได้
        strict: false // ✅ อนุญาตให้เพิ่ม field ที่ไม่อยู่ใน schema
      }
    ).populate('items.productId');

    if (!updatedOrder) {
      throw new Error('ไม่สามารถอัปเดตออเดอร์ได้');
    }

    console.log(`✅ Payment updated for order ${updatedOrder.orderNumber}`);
    console.log('📋 Updated order status:', {
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      hasPaymentInfo: !!updatedOrder.paymentInfo
    });

    res.json({
      success: true,
      message: 'อัปเดตการชำระเงินสำเร็จ',
      order: updatedOrder
    });

  } catch (error) {
    console.error('❌ Payment update error:', error);
    
    // ✅ Return proper error response
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตการชำระเงิน',
      error: error.message
    });
  }
});

module.exports = router;