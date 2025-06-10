// frontend/src/components/ProductCard.jsx


import React from 'react';
import AddToCartButton from './AddToCartButton';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.image || '/api/placeholder/300/200'}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        
        {/* Stock Status Badge */}
        {isOutOfStock && (
          <div className="stock-badge out-of-stock-badge">
            หมด
          </div>
        )}
        {isLowStock && (
          <div className="stock-badge low-stock-badge">
            เหลือ {product.stock}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>
        
        <p className="product-description">
          {product.description || 'ไม่มีรายละเอียดสินค้า'}
        </p>
        
        <div className="product-meta">
          <div className="product-price">
            {formatPrice(product.price)}
          </div>
          
          {product.category && (
            <div className="product-category">
              📦 {product.category}
            </div>
          )}
        </div>

        {/* Stock Info */}
        <div className="stock-info">
          {product.stock !== undefined && (
            <span className={`stock-text ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
              {isOutOfStock ? '❌ สินค้าหมด' : 
               isLowStock ? `⚠️ เหลือ ${product.stock} ชิ้น` : 
               `✅ มีสินค้า (${product.stock} ชิ้น)`}
            </span>
          )}
        </div>

        {/* Add to Cart Section */}
        <div className="product-actions">
          <AddToCartButton 
            product={product}
            variant="primary"
            size="medium"
            showQuantity={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;