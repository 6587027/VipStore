import React from 'react';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const handleAddToCart = () => {
    // TODO: เพิ่มสินค้าไปยังตะกร้า
    alert(`เพิ่ม ${product.name} ไปยังตะกร้าแล้ว!`);
  };

  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/280x200?text=No+Image';
        }}
      />
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">{formatPrice(product.price)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            คงเหลือ: {product.stock} ชิ้น
          </span>
          <button 
            className="btn-primary"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{ 
              opacity: product.stock === 0 ? 0.5 : 1,
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {product.stock === 0 ? 'หมด' : 'เพิ่มไปยังตะกร้า'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;