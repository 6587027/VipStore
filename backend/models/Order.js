 // backend/models/Order.js


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
  // เพิ่มหลังจาก paymentStatus: { ... }
paymentInfo: {
  method: {
    type: String,
    enum: ['qr_code', 'credit_card', 'bank_transfer', 'wallet', 'cash'],
    default: null
  },
  methodName: { type: String, default: null },
  paidAt: { type: Date, default: null },
  transactionId: { type: String, default: null },
  cardData: {
    last4: { type: String, default: null },
    cardType: { type: String, default: null }
  }
},


  
  // Dates
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date, default: null },
  
  // Optional Fields
  notes: { type: String, default: '' },
  trackingNumber: { type: String, default: '' }
}, {
  timestamps: true
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
  
  next();
});

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);