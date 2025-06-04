import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productsAPI } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  // ดึงข้อมูลสินค้าจาก API
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await productsAPI.getAll(params);
      
      setProducts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Other'];

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div>กำลังโหลดสินค้า...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchProducts}>
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Filter Section */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>กรองสินค้าตามหมวดหมู่</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            className={selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setSelectedCategory('')}
          >
            ทั้งหมด
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Count */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#1f2937' }}>
          สินค้าทั้งหมด ({products.length} รายการ)
          {selectedCategory && ` - หมวดหมู่: ${selectedCategory}`}
        </h2>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '16px' }}>ไม่พบสินค้า</h3>
          <p style={{ color: '#9ca3af' }}>
            {selectedCategory 
              ? `ไม่มีสินค้าในหมวดหมู่ ${selectedCategory}` 
              : 'ยังไม่มีสินค้าในระบบ'
            }
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;