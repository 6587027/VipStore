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

// 🔧 PUT /api/orders/admin/:id/status - Update order status (Admin) - FIXED WITH STOCK RESTORE
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber, notes } = req.body;
    const orderId = req.params.id;

    // 🔍 ดึงข้อมูล order เดิมก่อน
    const existingOrder = await Order.findById(orderId).populate('items.productId');
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`📝 Updating order ${existingOrder.orderNumber} from ${existingOrder.status} to ${status}`);

    // 🔄 ถ้าเปลี่ยนเป็น 'cancelled' และ order เดิมยังไม่ใช่ cancelled
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      console.log('🔄 Order cancelled - restoring stock...');
      
      // คืนสต็อกสินค้าทั้งหมดใน order
      for (const item of existingOrder.items) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            const oldStock = product.stock;
            product.stock += item.quantity; // เพิ่มสต็อกกลับ
            await product.save();
            
            console.log(`📦 Restored stock for ${product.name}: ${oldStock} + ${item.quantity} = ${product.stock}`);
          }
        } catch (error) {
          console.error(`❌ Error restoring stock for product ${item.productId}:`, error);
        }
      }
    }

    // 🔄 ถ้าเปลี่ยนจาก 'cancelled' เป็นสถานะอื่น
    if (existingOrder.status === 'cancelled' && status !== 'cancelled') {
      console.log('🔄 Order reactivated - deducting stock...');
      
      // หักสต็อกใหม่ (เพราะเมื่อยกเลิกไปแล้วได้คืนสต็อกไว้)
      for (const item of existingOrder.items) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            if (product.stock >= item.quantity) {
              const oldStock = product.stock;
              product.stock -= item.quantity; // หักสต็อกใหม่
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

    // 📝 อัพเดต order status
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    // Set delivery date if status changes to delivered
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

// 🔧 DELETE /api/orders/admin/:orderId - ลบออเดอร์ - FIXED WITH STOCK RESTORE
router.delete('/admin/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // 🔍 ดึงข้อมูล order ก่อนลบ
    const orderToDelete = await Order.findById(orderId).populate('items.productId');
    
    if (!orderToDelete) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์ที่ต้องการลบ'
      });
    }

    console.log(`🗑️ Deleting order ${orderToDelete.orderNumber} - status: ${orderToDelete.status}`);

    // 🔄 ถ้า order ยังไม่ถูก cancel ให้คืนสต็อกก่อนลบ
    if (orderToDelete.status !== 'cancelled') {
      console.log('🔄 Restoring stock before deletion...');
      
      for (const item of orderToDelete.items) {
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
    
    // ✅ ลบ order
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