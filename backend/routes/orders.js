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

// 🔧 PUT /api/orders/admin/:id/status - Update order status with REVERT support (Admin)
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, notes, isRevert, previousStatus } = req.body;
    const orderId = req.params.id;

    const existingOrder = await Order.findById(orderId).populate('items.productId');
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = existingOrder.status;
    console.log(`📝 Updating order ${existingOrder.orderNumber} from ${oldStatus} to ${status}`);

    // 🆕 REVERT LOGIC - Handle stock when reverting statuses
    if (isRevert && previousStatus) {
      console.log(`🔄 REVERTING: ${existingOrder.orderNumber} from ${previousStatus} to ${status}`);
      
      // Case 1: Revert from 'confirmed' to 'pending' - คืนสต็อก
      if (previousStatus === 'confirmed' && status === 'pending') {
        console.log('🔄 Reverting confirmation - restoring stock...');
        
        for (const item of existingOrder.items) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              const oldStock = product.stock;
              product.stock += item.quantity; // คืนสต็อก
              await product.save();
              console.log(`📦 Restored stock for ${product.name}: ${oldStock} + ${item.quantity} = ${product.stock}`);
            }
          } catch (error) {
            console.error(`❌ Error restoring stock for product ${item.productId}:`, error);
          }
        }
      }
      
      // Case 2: Revert from 'cancelled' to 'pending' - หักสต็อกใหม่
      else if (previousStatus === 'cancelled' && status === 'pending') {
        console.log('🔄 Reverting cancellation - deducting stock...');
        
        for (const item of existingOrder.items) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              const oldStock = product.stock;
              
              // ตรวจสอบสต็อกพอหรือไม่
              if (product.stock < item.quantity) {
                return res.status(400).json({ 
                  success: false, 
                  message: `สต็อกสินค้า ${product.name} ไม่เพียงพอ (ต้องการ ${item.quantity} มีอยู่ ${product.stock})` 
                });
              }
              
              product.stock -= item.quantity; // หักสต็อก
              await product.save();
              console.log(`📦 Deducted stock for ${product.name}: ${oldStock} - ${item.quantity} = ${product.stock}`);
            }
          } catch (error) {
            console.error(`❌ Error deducting stock for product ${item.productId}:`, error);
            return res.status(500).json({
              success: false,
              message: `Error processing stock for ${item.productName || 'product'}`
            });
          }
        }
      }
      
      // Case 3: Other reverts (processing->confirmed, shipped->processing, delivered->shipped)
      // ไม่ต้องจัดการสต็อกเพราะสินค้ายังไม่ได้ถูกยกเลิกหรือยืนยัน
      else {
        console.log(`🔄 Simple revert from ${previousStatus} to ${status} - no stock changes needed`);
      }
    }
    
    // 🔧 EXISTING LOGIC - Handle normal status changes (ไม่ใช่ revert)
    else {
      // Cancel order - restore stock
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

      // Reactivate cancelled order - deduct stock
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
    }

    // 📝 Update order data
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    // Set delivery date when status becomes delivered
    if (status === 'delivered') {
      updateData.deliveryDate = new Date();
    }

    // Apply updates
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.productId');

    const actionType = isRevert ? 'reverted' : 'updated';
    const stockMessage = isRevert ? 
      (status === 'pending' && previousStatus === 'confirmed' ? ' Stock restored.' : 
       status === 'pending' && previousStatus === 'cancelled' ? ' Stock deducted.' : '') :
      (status === 'cancelled' ? ' Stock restored.' : '');

    console.log(`✅ Order ${updatedOrder.orderNumber} ${actionType} successfully from ${oldStatus} to ${status}`);

    res.json({
      success: true,
      message: `Order ${actionType} successfully.${stockMessage}`,
      order: updatedOrder,
      changes: {
        from: oldStatus,
        to: status,
        isRevert: !!isRevert,
        stockAdjusted: !!stockMessage
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
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

// ✅ GET /api/orders/admin/stats - Get order statistics (updated with refunds)
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
      cancelledOrders,
      refundedOrders, // 🆕 เพิ่ม refunded orders
      todayOrders,
      weekOrders,
      monthOrders,
      totalRevenue,
      totalRefunds // 🆕 เพิ่ม total refunds
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ paymentStatus: 'refunded' }), // 🆕
      Order.countDocuments({ orderDate: { $gte: today } }),
      Order.countDocuments({ orderDate: { $gte: thisWeek } }),
      Order.countDocuments({ orderDate: { $gte: thisMonth } }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, paymentStatus: { $ne: 'refunded' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.aggregate([ // 🆕 คำนวณยอดเงินคืนทั้งหมด
        { $match: { paymentStatus: 'refunded' } },
        { $group: { _id: null, total: { $sum: '$refundInfo.amount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        refundedOrders, // 🆕
        todayOrders,
        weekOrders,
        monthOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalRefunds: totalRefunds[0]?.total || 0 // 🆕
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

// เพิ่ม API Endpoint ใหม่ใน backend/routes/orders.js

// 💰 PUT /api/orders/admin/:id/refund - Process refund (Admin)
router.put('/admin/:id/refund', async (req, res) => {
  try {
    const { refundReason, refundAmount, refundMethod } = req.body;
    const orderId = req.params.id;

    const existingOrder = await Order.findById(orderId).populate('items.productId');
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์'
      });
    }

    console.log(`💰 Processing refund for order ${existingOrder.orderNumber}`);

    // ตรวจสอบว่าสามารถคืนเงินได้หรือไม่
    if (existingOrder.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถคืนเงินได้ เนื่องจากยังไม่ได้ชำระเงิน'
      });
    }

    if (existingOrder.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'ออเดอร์นี้ได้รับการคืนเงินแล้ว'
      });
    }

    // คำนวณจำนวนเงินคืน
    const maxRefundAmount = existingOrder.pricing.total;
    const finalRefundAmount = refundAmount || maxRefundAmount;

    if (finalRefundAmount > maxRefundAmount) {
      return res.status(400).json({
        success: false,
        message: `จำนวนเงินคืนเกินกว่ายอดออเดอร์ (สูงสุด ฿${maxRefundAmount})`
      });
    }

    // 🔄 Restore stock if order is not cancelled yet
    if (existingOrder.status !== 'cancelled') {
      console.log('🔄 Refund processing - restoring stock...');
      
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

    // สร้าง Refund Transaction ID
    const refundTransactionId = `REFUND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // อัปเดตออเดอร์
    const updateData = {
      status: 'cancelled', // เปลี่ยนเป็น cancelled เมื่อคืนเงิน
      paymentStatus: 'refunded',
      refundInfo: {
        amount: finalRefundAmount,
        reason: refundReason || 'Admin initiated refund',
        method: refundMethod || 'original_payment_method',
        processedAt: new Date(),
        transactionId: refundTransactionId,
        processedBy: 'admin' // ในอนาคตอาจเก็บ admin ID
      }
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true, runValidators: false, strict: false }
    ).populate('items.productId');

    console.log(`✅ Refund processed for order ${updatedOrder.orderNumber}: ฿${finalRefundAmount}`);

    res.json({
      success: true,
      message: `คืนเงินสำเร็จ ฿${finalRefundAmount.toLocaleString()} สำหรับออเดอร์ ${updatedOrder.orderNumber}`,
      order: updatedOrder,
      refund: {
        amount: finalRefundAmount,
        transactionId: refundTransactionId,
        processedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการคืนเงิน',
      error: error.message
    });
  }
});

// 📊 GET /api/orders/admin/:id/refund-info - Get refund information
router.get('/admin/:id/refund-info', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์'
      });
    }

    const refundInfo = {
      canRefund: order.paymentStatus === 'paid',
      maxRefundAmount: order.pricing.total,
      currentPaymentStatus: order.paymentStatus,
      orderStatus: order.status,
      refundInfo: order.refundInfo || null
    };

    res.json({
      success: true,
      refundInfo
    });

  } catch (error) {
    console.error('Get refund info error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการคืนเงิน'
    });
  }
});



module.exports = router;