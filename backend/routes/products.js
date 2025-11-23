const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - ดึงสินค้าทั้งหมด
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 300, includeInactive } = req.query;
    
    console.log('🔍 GET /products query:', req.query); 

    let filter = {};
    
    // Check if we should include inactive products
    const shouldIncludeInactive = includeInactive === 'true' || includeInactive === true;
    
    if (!shouldIncludeInactive) {
      filter.isActive = true;
    }
    
    // กรองตาม category
    if (category) {
      filter.category = category;
    }
    
    // ค้นหาจากชื่อหรือคำอธิบาย
    if (search) {
      filter.$text = { $search: search };
    }
    
    const products = await Product.find(filter)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET /api/products/:id - ดึงสินค้าตาม ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// POST /api/products/bulk - เพิ่มสินค้าหลายรายการพร้อมกัน (สำหรับ Admin)
router.post('/bulk', async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Body must be an array of products'
      });
    }

    const products = await Product.insertMany(req.body);
    
    res.status(201).json({
      success: true,
      message: `Successfully created ${products.length} products`,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating products',
      error: error.message
    });
  }
});

// POST /api/products - สร้างสินค้าใหม่ (สำหรับ Admin)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// PUT /api/products/:id - อัพเดตสินค้า (สำหรับ Admin)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - ลบสินค้า (สำหรับ Admin)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

module.exports = router;