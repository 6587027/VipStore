// backend/models/Order.js - COMPLETE FIXED VERSION

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: false // ✅ เปลี่ยนเป็น false เพราะจะสร้างใน pre-save
  },
  
  // User Information (Reference) - ✅ แก้ไขให้รองรับ Test User
  userId: {
    type: mongoose.Schema.Types.Mixed, // ✅ เปลี่ยนจาก ObjectId เป็น Mixed
    required: false // Allow guest orders
  },
  
  // Customer Information (from address form)
  customerInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      district: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'Thailand' },
      notes: { type: String, default: '' }
    }
  },
  
  // Order Items
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
  }],
  
  // Pricing Information
  pricing: {
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  // Dates
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date, default: null },
  
  // Optional Fields
  notes: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },

  // ✅ FIXED: Refund Request (Customer initiated)
  refundRequest: {
    type: mongoose.Schema.Types.Mixed,
    default: null, // ✅ CRITICAL: Default เป็น null ไม่ใช่ empty object
    validate: {
      validator: function(value) {
        // ✅ Allow null or valid refund request object
        if (value === null || value === undefined) return true;
        
        // ✅ If not null, must be valid object with required fields
        if (typeof value === 'object' && value.id && value.status) {
          return true;
        }
        
        return false;
      },
      message: 'refundRequest must be null or a valid refund request object'
    }
  },

  // ✅ FIXED: Refund Info (Admin processed refunds)
  refundInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: null, // ✅ CRITICAL: Default เป็น null ไม่ใช่ empty object
    validate: {
      validator: function(value) {
        // ✅ Allow null or valid refund info object
        if (value === null || value === undefined) return true;
        
        // ✅ If not null, must be valid object with required fields
        if (typeof value === 'object' && value.amount && value.transactionId) {
          return true;
        }
        
        return false;
      },
      message: 'refundInfo must be null or a valid refund info object'
    }
  }

}, {
  timestamps: true,
  strict: false // ✅ Allow dynamic fields like paymentInfo
});

// ✅ แก้ไข orderNumber generation
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    // ตรวจสอบ orderNumber ที่มีอยู่แล้วในวันนี้
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `VIP-${year}${month}${day}`;
    
    // หาเลขที่มากที่สุดในวันนี้
    const latestOrder = await this.constructor.findOne({
      orderNumber: { $regex: `^${datePrefix}` }
    }).sort({ orderNumber: -1 });
    
    let nextNumber = 1;
    if (latestOrder) {
      const lastNumber = parseInt(latestOrder.orderNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const orderSuffix = String(nextNumber).padStart(3, '0');
    this.orderNumber = `${datePrefix}-${orderSuffix}`;
  }
  
  // ✅ แก้ไข userId handling
  if (this.userId && typeof this.userId === 'number') {
    // สำหรับ test users ที่มี id เป็น number
    this.userId = this.userId.toString();
  }
  
  // ✅ CRITICAL: Clean up refundRequest and refundInfo before save
  if (this.refundRequest && typeof this.refundRequest === 'object') {
    // ✅ ถ้าเป็น empty object ให้เปลี่ยนเป็น null
    const hasRefundData = this.refundRequest.id || 
                         this.refundRequest.status || 
                         this.refundRequest.requestedBy;
    
    if (!hasRefundData) {
      this.refundRequest = null;
    }
  }
  
  if (this.refundInfo && typeof this.refundInfo === 'object') {
    // ✅ ถ้าเป็น empty object ให้เปลี่ยนเป็น null
    const hasRefundInfo = this.refundInfo.amount || 
                         this.refundInfo.transactionId;
    
    if (!hasRefundInfo) {
      this.refundInfo = null;
    }
  }
  
  next();
});

// ✅ Static method สำหรับสร้าง refund request
orderSchema.statics.createRefundRequest = function(orderId, refundData) {
  const refundRequestId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  const refundRequest = {
    id: refundRequestId,
    requestedBy: refundData.userId,
    reason: refundData.reason || 'ลูกค้าขอคืนเงิน',
    requestedAmount: refundData.requestedAmount,
    maxRefundAmount: refundData.maxRefundAmount,
    status: 'pending',
    requestedAt: new Date(),
    customerInfo: {
      email: refundData.customerInfo.email,
      firstName: refundData.customerInfo.firstName,
      lastName: refundData.customerInfo.lastName,
      phone: refundData.customerInfo.phone
    }
  };
  
  return this.findByIdAndUpdate(
    orderId,
    { $set: { refundRequest } },
    { new: true, runValidators: false, strict: false }
  );
};

// ✅ Static method สำหรับ process refund
orderSchema.statics.processRefund = function(orderId, refundData) {
  const refundTransactionId = `REFUND-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const refundInfo = {
    amount: refundData.amount,
    reason: refundData.reason || 'Admin processed refund',
    method: refundData.method || 'original_payment_method',
    processedAt: new Date(),
    transactionId: refundTransactionId,
    processedBy: refundData.processedBy || 'admin',
    originalRequestId: refundData.originalRequestId
  };
  
  const updateData = {
    status: 'cancelled',
    paymentStatus: 'refunded',
    refundInfo
  };
  
  // ✅ Update refund request status if exists
  if (refundData.originalRequestId) {
    updateData['refundRequest.status'] = 'approved';
    updateData['refundRequest.processedAt'] = new Date();
    updateData['refundRequest.processedBy'] = refundData.processedBy || 'admin';
    updateData['refundRequest.approvedAmount'] = refundData.amount;
    updateData['refundRequest.adminNotes'] = refundData.adminNotes;
  }
  
  return this.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { new: true, runValidators: false, strict: false }
  );
};

// ✅ Instance method เพื่อตรวจสอบสิทธิ์ขอคืนเงิน
orderSchema.methods.canRequestRefund = function() {
  return (
    this.paymentStatus === 'paid' &&
    this.status !== 'cancelled' &&
    this.paymentStatus !== 'refunded' &&
    !this.refundRequest &&
    !this.refundInfo
  );
};

// ✅ Instance method เพื่อดูสถานะคืนเงิน
orderSchema.methods.getRefundStatus = function() {
  if (this.refundInfo) {
    return {
      type: 'processed',
      status: 'completed',
      amount: this.refundInfo.amount,
      transactionId: this.refundInfo.transactionId,
      processedAt: this.refundInfo.processedAt
    };
  }
  
  if (this.refundRequest) {
    return {
      type: 'request',
      status: this.refundRequest.status,
      requestedAmount: this.refundRequest.requestedAmount,
      reason: this.refundRequest.reason,
      requestedAt: this.refundRequest.requestedAt
    };
  }
  
  return null;
};

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ 'refundRequest.status': 1 });
orderSchema.index({ 'refundRequest.requestedAt': -1 });

module.exports = mongoose.model('Order', orderSchema);